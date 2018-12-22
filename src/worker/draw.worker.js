import { expose } from 'comlinkjs';

// worker.js
const myValue = 42;
class MyClass {
    constructor() {
        this.nodes = {};
        this.options = {};
    }

    logSomething(value) {
        console.log(`myValue = ${value}`);
    }

    addNode(node) {
        this.nodes[node.id] = node;
    }

    addNodes(nodes) {
        this.nodes = nodes;
    }

    addOptions(opt) {
        this.options = opt
    }

    draw() {
        console.log('INSIDE DRAW- options');

        const {
            zoomStage,
            scale,
            width: canvasW,
            height: canvasH,
            translateX: tx,
            translateY: ty,
            representImgSize,
            imgSize,
            drawScissors,
            scissorsStartX,
            scissorsStartY,
            scissorsEndX,
            scissorsEndY,
            sizeRange,
            cluster,
            sorted,
            neighbourImgSize,
            groupNeighbours,
            selectedLabel,
            selectedCategory,

            boarderRankedMode,
            sizeRankedMode,
            gradient,
            clusterMode,
            oldClusterMode,
            neighbourMode,
            representWithAlpha,
            repsMode,
            alphaBase,
            alphaIncrease,
            neighboursThreshold,
            labels,

            borderW,
        } = this.options;

        const canvasPixel = new Uint8ClampedArray(canvasW * canvasH * 4);
        const hitmapPixel = new ArrayBuffer(canvasW * canvasH * 4);


        Object.values(this.nodes).forEach((node) => {
            let imgS = sizeRankedMode ? zoomStage + Math.floor(node.rank * sizeRange) : zoomStage;
            imgS += imgSize; // add imgS from user input
            const isRepresent = (clusterMode && !node.isClusterd) || (oldClusterMode && node.cluster < cluster);

            if (neighbourMode && !node.group) {
                // the node should not be in the neighbours list
                const neighbour = groupNeighbours[node.index];
                if (neighbour && neighbour <= neighboursThreshold) {
                    imgS += neighbourImgSize;
                } else return;
            } else if (isRepresent) imgS += representImgSize;

            if (imgS < 0) imgS = 0;
            if (imgS > 14) imgS = 14;

            const img = node.imageData[imgS];
            if (!img) return console.error(`no image for node: ${node.id}exists`);

            const iw = img.width;
            const ih = img.height;

            const nodeX = Math.floor(node.x * scale + tx - iw / 2);
            const nodeY = Math.floor(node.y * scale + ty - ih / 2);

            // nothing to do if the image is outside the canvas
            const inside = nodeX > borderW
                && nodeY > borderW
                && nodeX < canvasW - iw - borderW
                && nodeY < canvasH - ih - borderW;
            if (!inside) return;

            // check if the image is allowed to draw in certain rules
            let show = true;

            // 1. Rule: some labels can be selected as "not show this"
            node.labels.forEach((nodeLabel, i) => {
                if (nodeLabel && labels[i]) {
                    labels[i].labels.forEach((e) => {
                        if (e && !e.show && e.name === nodeLabel) show = false;
                    });
                }
            });

            // 2. if neighbours mode:  check if node is not groupd

            // cluster
            // if (node.cluster < this.cluster) {
            const imgData = img.data;

            const neighbourColor = [250, 208, 44]; // yellow
            const groupColor = [100, 100, 100]; // black
            const nearColor = [0, 127, 0]; // gren

            /*
                DRAW IMAGE
             */
            if (show) {
                // loop through rows in img
                for (let row = 0; row < ih; row += 1) {
                    const canvasRow = ((nodeY + row) * canvasW + nodeX) * 4;
                    // loop through column in img
                    for (let col = 0; col < iw; col += 1) {
                        const c = canvasRow + col * 4;
                        const p = (row * iw + col) * 4;
                        canvasPixel[c] = imgData[p]; // R
                        canvasPixel[c + 1] = imgData[p + 1]; // G
                        canvasPixel[c + 2] = imgData[p + 2]; // B
                        canvasPixel[c + 3] = representWithAlpha && isRepresent
                            ? 200
                            : canvasPixel[c + 3]
                                ? canvasPixel[c + 3] + 10 * node.cliqueLen
                                : alphaBase + zoomStage * alphaIncrease; // special mode for represents // img over other img // white background

                        // draw hitmap
                        hitmapPixel[c] = node.colorKey[0]; // R
                        hitmapPixel[c + 1] = node.colorKey[1]; // G
                        hitmapPixel[c + 2] = node.colorKey[2]; // B
                        hitmapPixel[c + 3] = 255; //
                    }
                }
            }

            /*
                DRAW RANK COLOR BORDER
             */
            if (boarderRankedMode) {
                const color = gradient[node.cliqueLen];
                // draw boarder
                for (let row = -2; row <= ih + 1; row += 1) {
                    const canvasRow = ((nodeY + row) * canvasW + nodeX) * 4;
                    if (row === -2 || row === ih + 1) {
                        // draw top line r
                        for (let col = 0; col < iw; col += 1) {
                            const c = canvasRow + col * 4;
                            canvasPixel[c] = color[0]; // R
                            canvasPixel[c + 1] = color[1]; // G
                            canvasPixel[c + 2] = color[2]; // B
                            canvasPixel[c + 3] = 200;
                        }
                    } else {
                        // draw left boarder
                        const l = canvasRow - 8;
                        canvasPixel[l] = color[0]; // R
                        canvasPixel[l + 1] = color[1]; // G
                        canvasPixel[l + 2] = color[2]; // B
                        canvasPixel[l + 3] = 200;

                        // draw left boarder
                        const r = canvasRow + (iw + 1) * 4;
                        canvasPixel[r] = color[0]; // R
                        canvasPixel[r + 1] = color[1]; // G
                        canvasPixel[r + 2] = color[2]; // B
                        canvasPixel[r + 3] = 200;
                    }
                }
            }

            /*
                DRAW LABEL BORDER
             */
            // Todo get variables via this.ui
            const labelBorder = selectedCategory
                && selectedLabel
                && selectedLabel === node.labels[selectedCategory];
            if (labelBorder) {
                const { color } = labels[selectedCategory].labels.find(
                    e => e.name === selectedLabel,
                );
                // draw boarder
                for (let row = -2; row <= ih + 1; row += 1) {
                    const canvasRow = ((nodeY + row) * canvasW + nodeX) * 4;
                    if (row === -2 || row === ih + 1) {
                        // draw top line r
                        for (let col = 0; col < iw; col += 1) {
                            const c = canvasRow + col * 4;
                            canvasPixel[c] = color[0]; // R
                            canvasPixel[c + 1] = color[1]; // G
                            canvasPixel[c + 2] = color[2]; // B
                            canvasPixel[c + 3] = 200;
                        }
                    } else {
                        // draw left boarder
                        const l = canvasRow - 8;
                        canvasPixel[l] = color[0]; // R
                        canvasPixel[l + 1] = color[1]; // G
                        canvasPixel[l + 2] = color[2]; // B
                        canvasPixel[l + 3] = 200;

                        // draw left boarder
                        const r = canvasRow + (iw + 1) * 4;
                        canvasPixel[r] = color[0]; // R
                        canvasPixel[r + 1] = color[1]; // G
                        canvasPixel[r + 2] = color[2]; // B
                        canvasPixel[r + 3] = 200;
                    }
                }
            }

            /*
                DRAW GROUP BORDER
             */
            const neighbour = groupNeighbours[node.index];
            // TODO Perfomance is maybe bedder without another loop

            // draw only if group, label2 or neighbour
            if (
                !node.group
                && !node.isNearly
                && (!neighbour || neighbour > neighboursThreshold)
            ) return;

            const lineColor = neighbour
                ? neighbourColor
                : node.isNearly
                    ? nearColor
                    : node.group
                        ? groupColor
                        : null;
            if (lineColor) {
                for (let row = -2; row <= ih + 1; row += 1) {
                    const canvasRow = ((nodeY + row) * canvasW + nodeX) * 4;
                    if (row === -2 || row === ih + 1) {
                        // draw top line r
                        for (let col = 0; col < iw; col += 1) {
                            const c = canvasRow + col * 4;
                            canvasPixel[c] = lineColor[0]; // R
                            canvasPixel[c + 1] = lineColor[1]; // G
                            canvasPixel[c + 2] = lineColor[2]; // B
                            canvasPixel[c + 3] = 200;
                        }
                    } else {
                        // draw left boarder
                        const l = canvasRow - 8;
                        canvasPixel[l] = lineColor[0]; // R
                        canvasPixel[l + 1] = lineColor[1]; // G
                        canvasPixel[l + 2] = lineColor[2]; // B
                        canvasPixel[l + 3] = 200;

                        // draw left boarder
                        const r = canvasRow + (iw + 1) * 4;
                        canvasPixel[r] = lineColor[0]; // R
                        canvasPixel[r + 1] = lineColor[1]; // G
                        canvasPixel[r + 2] = lineColor[2]; // B
                        canvasPixel[r + 3] = 200;
                    }
                }
            }
        });
        return canvasPixel;
    }
}
export default expose(MyClass, self);
