/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
export default class Node {
    constructor(data, ctx, hitCtx) {
        this.name = data.name;
        this.links = data.links;
        this.index = data.index;
        this._x = data.x;
        this._y = data.y;
        this._width = 1; // 40;
        this._height = 1; // 40;
        this.colorKey = data.colorKey;
        this.color = data.color;
        this.ctx = ctx;
        this.hitCtx = hitCtx;

        this.group = false;
        this.groupId = 0;
        this.clique = data.clique;
        this.cliqueLen = data.clique.length;

        this.cluster = data.cluster;
        this.positives = data.positives;
        this.negatives = data.negatives;

        this.label = data.label;
        this.label2 = data.label2 || null;
        this.labels = data.labels;
        // x,y for reseting
        // this.initX = data.x;
        // this.initY = data.y;

        // this.activeScale = 3; // showing images bigger
        // this.icon = new Image();
        // this.icon.src = data.buffer;

        this.rank = data.rank;

        // this.pics = {};
        this.imageData = {};

        try {
            // this.icon = new Image();
            // this.icon.src = data.buffer;

            // TODO das kann sicherlich optimiert werden
            // const canvas = document.createElement('canvas');
            // const context = canvas.getContext('2d');
            Object.values(data.pics).forEach((pic, i) => {
                this.imageData[i] = new ImageData(
                    new Uint8ClampedArray(pic.data),
                    pic.info.width,
                    pic.info.height,
                );
                // const img = new Image();
                // img.src = pic;
                // img.onload = async () => {
                //     this.pics[i] = await createImageBitmap(img);
                //     canvas.width = img.width;
                //     canvas.height = img.height;
                //     context.drawImage(img, 0, 0);
                //     this.imageData[i] = context.getImageData(0, 0, img.width, img.height);
                // };
                if (i === 9) {
                    const canvas = document.createElement('canvas');
                    const img = this.imageData[i];
                    canvas.width = img.width; // or 'width' if you want a special/scaled size
                    canvas.height = img.height; // or 'height' if you want a special/scaled size

                    canvas.getContext('2d').putImageData(img, 0, 0);
                    this.icon = canvas.toDataURL('image/png');
                }
            });
        } catch (e) {
            console.error(e);
            console.log(this);
            console.log(data);
        }

        this._isActive = false; // handle clicked node
        this.isActiveNeighbour = false; // is this a neighbour of a active node?
        this.hasImage = false; // is there detailed image?

        this.image = new Image(); // rest is set throuh socket-receiveImage
        // this.image.src = `data:image/jpeg;base64,${data.buffer}`;

        this.imgScale = null; // used for scaling img width
        //
        // this.timerId = 0;

        this._value = null; // value will be set by the active nodes neighbour-values, default is 5

        // this.imgData = makeImgageData(this.icon)
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
    }

    get value() {
        return this._value;
    }

    set value(v) {
        if (v < 0.1) this._value = 0.1;
        else if (v > 1) this._value = 1;
        else this._value = v;
    }

    get isActive() {
        return this._isActive;
    }

    set isActive(v) {
        this._isActive = v;
    }

    // if isActive
    // scale x to real/current 2d-coords
    // subtract half width for moving left, width scaled with ImageScale
    // scale back to Node x/y
    /*
        TODO the last point is because of the context ...
        TODO ... is scaling it again - maybe we could get rid of this?
    */

    get x() {
        // return this._x - (this.width / 2 / this.scale);
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        // return this._y - (this.height / 2 / this.scale);
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    // simple changing the x/y is not possible because
    // they have special getters witch would be use while setting/+= values
    move(x, y) {
        this._x += x;
        this._y += y;
    }

    // ctx is the canvas context
    // scale change through zooming and is used for positioning the images
    draw(scale, scale2, imgWidth) {
        // console.log('start draw Image');
        // check which picture to use
        // this.scale = 1; // scale;

        // const imgData = this.imageData[scale2];
        const imgData = this.icon;
        if (imgData) {
            // const x = this.x;
            // const y = this.y;
            // const w = this.width / scale / 2;
            // const h = this.height / scale / 2;

            // old architecture
            const w = (imgData.width * imgWidth) / 100 / scale2;
            const h = (imgData.height * imgWidth) / 100 / scale2;
            const x = this._x - w / 2;
            const y = this._y - h / 2;

            // new archetecture 1
            // const w = imgData.width;
            // const h = imgData.height;
            // const x = (this._x * scale) - (w / 2);
            // const y = (this._y * scale) - (h / 2);

            // const w = imgData.width;
            // const h = imgData.height;
            // const x = (this._x - (w / 2)) * scale;
            // const y = (this._y - (h / 2)) * scale;
            // const x = Math.floor((this._x * scale) - (w / 2)); // TODO PERFORMANCE ??? Rounde faster than not?
            // const y = Math.floor((this._y * scale) - (h / 2));

            // const data = await createImageBitmap(imgData, 0, 0, w, h)
            // createImageBitmap(imgData,0, 0, 2, 2, {resizeHeight: h, resizeWidth: w}).then(data => {
            //     console.log(data)
            //     this.ctx.drawImage(data, x, y)
            // })
            // console.log({ x, y, h, w });
            this.ctx.drawImage(imgData, x, y, w, h); // TODO Performance drawImage - putImageData

            // this.hitCtx.fillStyle = this.colorKey;
            // this.hitCtx.fillRect(x, y, w, h);
        }
        // draw HitCanvas rect
    }

    drawClusterd(scale, scale2, imgWidth, cluster) {
        const s = 1 / scale;
        const x = this._x;
        const y = this._y;

        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(x, y, s, s);
    }

    drawAsActive(scale, activeImgWidth) {
        this.scale = 1; // scale;

        const imgData = this.icon; // this.hasImage ? this.image : this.icon;

        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale / 2;
        const h = this.height; // scale / 2 ; */

        /* const w = activeImgWidth / 10;
        const h = activeImgWidth / 10; */
        const w = (imgData.width * activeImgWidth) / 1000; // TODO if image returns check if this width should be still used
        const h = (imgData.height * activeImgWidth) / 1000;
        const x = this._x - w / 2;
        const y = this._y - h / 2;

        this.ctx.putImageData(imgData, x, y, w, h);

        // draw HitCanvas rect
        this.hitCtx.fillStyle = this.colorKey;
        this.hitCtx.fillRect(x, y, w, h);
    }

    drawAsNeighbour(scale, activeImgWidth, strength) {
        this.scale = 1; // scale;

        const imgData = this.icon; // this.hasImage ? this.image : this.icon;

        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale / 2;
        const h = this.height; // scale / 2 ; */

        /* const w = (activeImgWidth / 10) * this.value;
        const h = (activeImgWidth / 10) * this.value; */
        const w = (imgData.width * activeImgWidth * strength) / 1000; //* this.value; // TODO if image returns check if this width should be still used
        const h = (imgData.height * activeImgWidth * strength) / 1000; //* this.value;
        const x = this._x - w / 2;
        const y = this._y - h / 2;

        this.ctx.drawImage(imgData, x, y, w, h);

        // draw HitCanvas rect
        this.hitCtx.fillStyle = this.colorKey;
        this.hitCtx.fillRect(x, y, w, h);
    }

    drawBorder(scale, imgWidth, activeImgWidth, cluster, borderWidth, labelColor) {
        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale;
        const h = this.height; // scale;
        */

        const w = (this.icon.width
                * (this.isActive
                    ? activeImgWidth
                    : this.isActiveNeighbour
                        ? activeImgWidth * this.value
                        : imgWidth))
            / 1000;
        const h = (this.icon.height
                * (this.isActive
                    ? activeImgWidth
                    : this.isActiveNeighbour
                        ? activeImgWidth * this.value
                        : imgWidth))
            / 1000;

        const x = this._x - w / 2;
        const y = this._y - h / 2;

        const lineWidth = borderWidth / 10 / scale;
        this.ctx.strokeStyle = labelColor || this.color;
        this.ctx.lineWidth = lineWidth;

        if (this.cluster < cluster || this.isActive || this.isActiveNeighbour) {
            // cluster represent
            if (lineWidth) this.ctx.strokeRect(x, y, w, h);
        } else {
            if (lineWidth) this.ctx.strokeRect(x, y, w / scale, h / scale);
            this.hitCtx.fillStyle = this.colorKey;
            this.hitCtx.fillRect(x, y, w / scale, h / scale);
        }
    }
}
