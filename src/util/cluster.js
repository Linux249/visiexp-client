import Kdbush from 'kdbush';

export default function supercluster(options) {
    return new SuperCluster(options);
}

function SuperCluster(options) {
    this.options = extend(Object.create(this.options), options);
    this.trees = new Array(this.options.maxZoom + 1);
}

SuperCluster.prototype = {
    options: {
        minZoom: 0, // min zoom to generate clusters on
        maxZoom: 16, // max zoom level to cluster the points on
        radius: 40, // cluster radius in pixels
        extent: 512, // tile extent (radius is calculated relative to it)
        nodeSize: 64, // size of the KD-tree leaf node, affects performance
        log: false, // whether to log timing info
    },

    load(points) {
        const { log } = this.options;

        if (log) console.time('total time');

        const timerId = `prepare ${points.length} points`;
        if (log) console.time(timerId);

        this.points = points;

        // generate a cluster object for each point and index input points into a KD-tree
        let clusters = [];
        for (let i = 0; i < points.length; i += 1) {
            // each point needs the geometry propertie
            clusters.push(createPointCluster(points[i], i));
        }
        this.trees[this.options.maxZoom + 1] = new Kdbush(
            clusters,
            getX,
            getY,
            this.options.nodeSize,
            Float32Array,
        );

        if (log) console.timeEnd(timerId);

        // cluster points on max zoom, then cluster the results on previous zoom, etc.;
        // results in a cluster hierarchy across zoom levels
        for (let z = this.options.maxZoom; z >= this.options.minZoom; z -= 1) {
            const now = log && +Date.now();

            // create a new set of clusters for the zoom and index them with a KD-tree
            clusters = this._cluster(clusters, z);
            this.trees[z] = new Kdbush(clusters, getX, getY, this.options.nodeSize, Float32Array);

            if (log) console.log('z%d: %d clusters in %dms', z, clusters.length, +Date.now() - now);
        }

        if (log) console.timeEnd('total time');

        return this;
    },

    getClusters(bbox, zoom) {
        const minX = bbox[0];
        const minY = bbox[1];
        const maxX = bbox[2];
        const maxY = bbox[3];

        const tree = this.trees[this._limitZoom(zoom)];

        const ids = tree.range(minX, minY, maxX, maxY);
        /* console.log({
            tree,
            ids,
            minLng: minX,
            maxLat: maxY,
            maxLng: maxX,
            minLat: minY,
        }); */
        // console.log(this.trees);
        const clusters = [];
        for (let i = 0; i < ids.length; i++) {
            const c = tree.points[ids[i]];
            // console.log(c);
            clusters.push(c.numPoints ? getClusterJSON(c) : this.points[c.index]);
        }
        return clusters;
    },

    getChildren(clusterId) {
        const originId = clusterId >> 5; // eslint-disable-line no-bitwise
        const originZoom = clusterId % 32;
        const errorMsg = 'No cluster with the specified id.';

        const index = this.trees[originZoom];
        if (!index) throw new Error(errorMsg);

        const origin = index.points[originId];
        if (!origin) throw new Error(errorMsg);

        const r = this.options.radius / (this.options.extent * 2 ** (originZoom - 1));
        const ids = index.within(origin.x, origin.y, r);
        const children = [];
        for (let i = 0; i < ids.length; i += 1) {
            const c = index.points[ids[i]];
            if (c.parentId === clusterId) {
                children.push(c.numPoints ? getClusterJSON(c) : this.points[c.index]);
            }
        }

        if (children.length === 0) throw new Error(errorMsg);

        return children;
    },

    getLeaves(clusterId, limit = Infinity, offset = 0) {
        const leaves = [];
        this._appendLeaves(leaves, clusterId, limit, offset, 0);

        return leaves;
    },

    getClusterExpansionZoom(clusterId) {
        let clusterZoom = (clusterId % 32) - 1;
        while (clusterZoom < this.options.maxZoom) {
            const children = this.getChildren(clusterId);
            clusterZoom += 1;
            if (children.length !== 1) break;
            clusterId = children[0].properties.cluster_id;
        }
        return clusterZoom;
    },

    _appendLeaves(result, clusterId, limit, offset, skipped) {
        const children = this.getChildren(clusterId);

        for (let i = 0; i < children.length; i++) {
            const props = children[i].properties;

            if (props && props.cluster) {
                if (skipped + props.point_count <= offset) {
                    // skip the whole cluster
                    skipped += props.point_count;
                } else {
                    // enter the cluster
                    skipped = this._appendLeaves(result, props.cluster_id, limit, offset, skipped);
                    // exit the cluster
                }
            } else if (skipped < offset) {
                // skip a single point
                skipped += 1;
            } else {
                // add a single point
                result.push(children[i]);
            }
            if (result.length === limit) break;
        }

        return skipped;
    },

    _limitZoom(z) {
        return Math.max(this.options.minZoom, Math.min(z, this.options.maxZoom + 1));
    },

    _cluster(points, zoom) {
        const clusters = [];
        // const r = this.options.radius / (this.options.extent * (2 ** zoom));
        // todo radius should maybe behave like scale
        const r = this.options.radius / (this.options.extent * 2 ** zoom);

        // console.log(r);
        // loop through each point
        for (let i = 0; i < points.length; i += 1) {
            const p = points[i];
            // if we've already visited the point at this zoom level, skip it
            if (p.zoom <= zoom) continue;
            p.zoom = zoom;

            // find all nearby points
            const tree = this.trees[zoom + 1];

            const neighborIds = tree.within(p.x, p.y, r);
            // console.log({ neighborIds });

            let numPoints = p.numPoints || 1;
            let wx = p.x * numPoints;
            let wy = p.y * numPoints;

            // encode both zoom and point index on which the cluster originated
            const id = (i << 5) + (zoom + 1); // eslint-disable-line no-bitwise

            const all = [];
            for (let j = 0; j < neighborIds.length; j++) {
                const b = tree.points[neighborIds[j]];
                // filter out neighbors that are already processed
                if (b.zoom <= zoom) continue;
                all.push(b);
                b.zoom = zoom; // save the zoom (so it doesn't get processed twice)

                const numPoints2 = b.numPoints || 1;
                wx += b.x * numPoints2; // accumulate coordinates for calculating weighted center
                wy += b.y * numPoints2;

                numPoints += numPoints2;
                b.parentId = id;
            }
            // console.log({all})

            if (numPoints === 1) {
                p.isClusterd = true;
                clusters.push(p);
            } else {
                p.parentId = id;
                let centroidId = null;
                let min = Infinity;
                const x = wx / numPoints;
                const y = wy / numPoints;
                if (!all.length) {
                    centroidId = p.properties.centroidId;
                } else {
                    if (p.properties && p.properties.centroidId) {
                        const pp = this.points[p.id >> 5];
                        min = distance([pp.x, pp.y], [x, y]);
                        centroidId = pp.properties.index;
                    }
                    all.forEach((poi) => {
                        const dist = distance([poi.x, poi.y], [x, y]);
                        if (dist < min) {
                            min = dist;
                            // console.log('new rep')
                            // console.log({p})
                            centroidId = this.points[poi.index || poi.id >> 5].properties.index; // eslint-disable-line no-bitwise
                        }
                    });
                }
                // console.error(p)
                // console.log(id - id >> 5, x, y, id >> 5, numPoints, properties, all)
                clusters.push(createCluster(x, y, id, numPoints, { centroidId }, all));
            }
        }

        // console.log(clusters.length);
        return clusters;
    },
};

function distance(v1, v2) {
    return Math.hypot(v2[0] - v1[0], v2[1] - v1[1]);
}

function createCluster(x, y, id, numPoints, properties, all) {
    return {
        x, // weighted cluster center
        y,
        zoom: Infinity, // the last zoom the cluster was processed at
        id, // encodes index of the first child of the cluster and its zoom level
        parentId: -1, // parent cluster id
        numPoints,
        properties,
    };
}

// point cluster have just one point inside, on initialisation very point become such a cluster
function createPointCluster(p, id) {
    return {
        x: p.x, // projected point coordinates
        y: p.y,
        zoom: Infinity, // the last zoom the point was processed at
        index: id, // index of the source feature in the original input array,
        parentId: -1, // parent cluster id
        repId: id,
    };
}

function getClusterJSON(cluster) {
    return {
        id: cluster.id,
        properties: getClusterProperties(cluster),
        x: cluster.x,
        y: cluster.y,
    };
}

function getClusterProperties(cluster) {
    // const count = cluster.numPoints;
    /* const abbrev = count >= 10000 ? `${Math.round(count / 1000)}k`
        : count >= 1000 ? `${Math.round(count / 100) / 10}k` : count; */
    return extend(extend({}, cluster.properties), {
        cluster: true,
        cluster_id: cluster.id,
        point_count: cluster.numPoints,
        // point_count_abbreviated: abbrev,
    });
}

function extend(dest, src) {
    for (const id in src) dest[id] = src[id];
    return dest;
}

function getX(p) {
    return p.x;
}

function getY(p) {
    return p.y;
}
