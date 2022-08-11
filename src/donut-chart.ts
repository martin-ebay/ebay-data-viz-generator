const numberReg = /[+-]?\d+(\.\d+)?/g;
const clockwise = 1;
const counterClockwise = 0;

// size is for the large / medium / small options
const sizeSmall = 75; // 72 + donutWidthSmall*0.5 rounded up;
const sizeMedium = 124; // 120 + donutWidthMedium*0.5
const sizeLarge = 236; // 232 + donutWidthMedium*0.5

// padding is the angle size gap between segments
const paddingSmall = 12;
const paddingMedium = 12;
const paddingLarge = 14;

// donutWidth is the thickness of the donut line
const donutWidthSmall = 5;
const donutWidthMedium = 8;
const donutWidthLarge = 14;

// cornerMultiplier adjust the corner radius on the end caps
const cornerMultiplier = 0.3;
const cornerMultiplierLarge = 0.2;

/**
 * Convert polar coordinates (radius, angle) to cartesian ones (x, y)
 * @param  {float} r      Radius
 * @param  {float} angle  Angle
 * @return {object}       Cartesian coordinates as object: {x, y}
 */
const _polarToCartesian = (r, angle) => ({
    x: r * Math.cos((angle * Math.PI) / 180),
    y: r * Math.sin((angle * Math.PI) / 180),
});

interface portion {
    rawValue: string;
    value: number;
    percentage: number;
    text: string;
};
interface portions extends Array<portion> {};

export class DonutChartPathGenerator {
    public portions:portions;
    public size:number;
    public center:number;

    private total:number;
    private padding:number;
    private donutWidth:number;
    private corner:number;
    
    constructor(input) {
        this.size = input.size === 'small' ? sizeSmall : sizeMedium;
        this.size = input.size === 'large' ? sizeLarge : this.size;

        this.padding = input.size === 'small' ? paddingSmall : paddingMedium;
        this.padding = input.size === 'large' ? paddingLarge : this.padding;

        this.donutWidth = input.size === 'small' ? donutWidthSmall : donutWidthMedium;
        this.donutWidth = input.size === 'large' ? donutWidthLarge : this.donutWidth;

        this.corner = input.size === 'large' ? cornerMultiplierLarge : cornerMultiplier;
        this.center = this.size * 0.5;
        this.portions = input.portions.map((p) => ({
            rawValue: p.value,
            value: p.value.match(numberReg).map((v) => parseFloat(v))[0],
            text: p.text
        }))
        this.total = this.portions.reduce((p, c) => p + c.value, 0);
        this.portions = this.portions.map((p) => ({
            ...p,
            percentage: p.value / this.total,
        }));
    }

    getPortionShape(percentage, startIndex) {
        const padding = this.padding * this.portions.length;
        const angle = Math.max(0, percentage * 360 - padding / this.portions.length);
        let startAngle = -90;
        if (startIndex > 0) {
            for (let i = 0; i < startIndex; i++) {
                startAngle += Math.max(0, this.portions[i].percentage * 360);
            }
        }
        return this.makeSectorShape(startAngle, angle);
    }
    makeSectorShape(startAngle, angle) {
        const center = this.center;
        const width = this.donutWidth;
        const radius = center - width;

        let a = angle;

        if (angle > 0 && angle < 0.3) {
            // Tiny angles smaller than ~0.3° can produce weird-looking paths
            a = 0;
        } else if (angle > 359.999) {
            // If progress is full, notch it back a little, so the path doesn't become 0-length
            a = 359.999;
        }

        const capSize = this.donutWidth * this.corner;
        const endAngle = startAngle + a,
            outterRadius = radius - width * 0.5,
            innerRadius = radius + width * 0.5,
            innerBevelRadius = radius - (width * 0.5 - this.donutWidth * this.corner),
            outterBevelRadius = radius + (width * 0.5 - this.donutWidth * this.corner),
            innerBevelBezierRadius = radius - width * 0.5,
            outterBevelBezierRadius = radius + width * 0.5,
            startCoords = _polarToCartesian(innerRadius, startAngle),
            endCoords = _polarToCartesian(innerRadius, endAngle),
            outerStartCoords = _polarToCartesian(outterRadius, startAngle),
            outerEndCoords = _polarToCartesian(outterRadius, endAngle),
            endOutterBevelCoords = _polarToCartesian(outterBevelRadius, endAngle + capSize),
            endInnerBevelCoords = _polarToCartesian(innerBevelRadius, endAngle + capSize),
            startOutterBevelCoords = _polarToCartesian(outterBevelRadius, startAngle - capSize),
            startInnerBevelCoords = _polarToCartesian(innerBevelRadius, startAngle - capSize),
            startOutterBevelBezierCoords = _polarToCartesian(
                outterBevelBezierRadius,
                startAngle - capSize
            ),
            startInnerBevelBezierCoords = _polarToCartesian(
                innerBevelBezierRadius,
                startAngle - capSize
            ),
            endOutterBevelBezierCoords = _polarToCartesian(
                outterBevelBezierRadius,
                endAngle + capSize
            ),
            endInnerBevelBezierCoords = _polarToCartesian(
                innerBevelBezierRadius,
                endAngle + capSize
            ),
            x1 = center + startCoords.x,
            x2 = center + endCoords.x,
            y1 = center + startCoords.y,
            y2 = center + endCoords.y,
            x3 = center + outerStartCoords.x,
            x4 = center + outerEndCoords.x,
            y3 = center + outerStartCoords.y,
            y4 = center + outerEndCoords.y;

        return [
            // inner arc of pie segment
            'M',
            x1,
            y1,
            'A',
            innerRadius,
            innerRadius,
            0,
            +(a > 180),
            clockwise,
            x2,
            y2,

            // end cap with rounded corners
            'Q',
            center + endOutterBevelBezierCoords.x,
            center + endOutterBevelBezierCoords.y,
            center + endOutterBevelCoords.x,
            center + endOutterBevelCoords.y,
            'L',
            center + endInnerBevelCoords.x,
            center + endInnerBevelCoords.y,
            'Q',
            center + endInnerBevelBezierCoords.x,
            center + endInnerBevelBezierCoords.y,
            x4,
            y4,

            // outter arc of pie segment
            'A',
            outterRadius,
            outterRadius,
            0,
            +(a > 180),
            counterClockwise,
            x3,
            y3,

            // start cap with rounded corners
            'Q',
            center + startInnerBevelBezierCoords.x,
            center + startInnerBevelBezierCoords.y,
            center + startInnerBevelCoords.x,
            center + startInnerBevelCoords.y,
            'L',
            center + startOutterBevelCoords.x,
            center + startOutterBevelCoords.y,
            'Q',
            center + startOutterBevelBezierCoords.x,
            center + startOutterBevelBezierCoords.y,
            x1,
            y1,
        ].join(' ');
    }
}
