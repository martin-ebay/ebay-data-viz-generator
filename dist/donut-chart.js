"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonutChartPathGenerator = void 0;
var numberReg = /[+-]?\d+(\.\d+)?/g;
var clockwise = 1;
var counterClockwise = 0;
// size is for the large / medium / small options
var sizeSmall = 75; // 72 + donutWidthSmall*0.5 rounded up;
var sizeMedium = 124; // 120 + donutWidthMedium*0.5
var sizeLarge = 236; // 232 + donutWidthMedium*0.5
// padding is the angle size gap between segments
var paddingSmall = 12;
var paddingMedium = 12;
var paddingLarge = 14;
// donutWidth is the thickness of the donut line
var donutWidthSmall = 5;
var donutWidthMedium = 8;
var donutWidthLarge = 14;
// cornerMultiplier adjust the corner radius on the end caps
var cornerMultiplier = 0.3;
var cornerMultiplierLarge = 0.2;
/**
 * Convert polar coordinates (radius, angle) to cartesian ones (x, y)
 * @param  {float} r      Radius
 * @param  {float} angle  Angle
 * @return {object}       Cartesian coordinates as object: {x, y}
 */
var _polarToCartesian = function (r, angle) { return ({
    x: r * Math.cos((angle * Math.PI) / 180),
    y: r * Math.sin((angle * Math.PI) / 180),
}); };
;
;
var DonutChartPathGenerator = /** @class */ (function () {
    function DonutChartPathGenerator(input) {
        var _this = this;
        this.size = input.size === 'small' ? sizeSmall : sizeMedium;
        this.size = input.size === 'large' ? sizeLarge : this.size;
        this.padding = input.size === 'small' ? paddingSmall : paddingMedium;
        this.padding = input.size === 'large' ? paddingLarge : this.padding;
        this.donutWidth = input.size === 'small' ? donutWidthSmall : donutWidthMedium;
        this.donutWidth = input.size === 'large' ? donutWidthLarge : this.donutWidth;
        this.corner = input.size === 'large' ? cornerMultiplierLarge : cornerMultiplier;
        this.center = this.size * 0.5;
        this.portions = input.portions.map(function (p) { return ({
            rawValue: p.value,
            value: p.value.match(numberReg).map(function (v) { return parseFloat(v); })[0],
            text: p.text
        }); });
        this.total = this.portions.reduce(function (p, c) { return p + c.value; }, 0);
        this.portions = this.portions.map(function (p) { return (__assign(__assign({}, p), { percentage: p.value / _this.total })); });
    }
    DonutChartPathGenerator.prototype.getPortionShape = function (percentage, startIndex) {
        var padding = this.padding * this.portions.length;
        var angle = Math.max(0, percentage * 360 - padding / this.portions.length);
        var startAngle = -90;
        if (startIndex > 0) {
            for (var i = 0; i < startIndex; i++) {
                startAngle += Math.max(0, this.portions[i].percentage * 360);
            }
        }
        return this.makeSectorShape(startAngle, angle);
    };
    DonutChartPathGenerator.prototype.makeSectorShape = function (startAngle, angle) {
        var center = this.center;
        var width = this.donutWidth;
        var radius = center - width;
        var a = angle;
        if (angle > 0 && angle < 0.3) {
            // Tiny angles smaller than ~0.3° can produce weird-looking paths
            a = 0;
        }
        else if (angle > 359.999) {
            // If progress is full, notch it back a little, so the path doesn't become 0-length
            a = 359.999;
        }
        var capSize = this.donutWidth * this.corner;
        var endAngle = startAngle + a, outterRadius = radius - width * 0.5, innerRadius = radius + width * 0.5, innerBevelRadius = radius - (width * 0.5 - this.donutWidth * this.corner), outterBevelRadius = radius + (width * 0.5 - this.donutWidth * this.corner), innerBevelBezierRadius = radius - width * 0.5, outterBevelBezierRadius = radius + width * 0.5, startCoords = _polarToCartesian(innerRadius, startAngle), endCoords = _polarToCartesian(innerRadius, endAngle), outerStartCoords = _polarToCartesian(outterRadius, startAngle), outerEndCoords = _polarToCartesian(outterRadius, endAngle), endOutterBevelCoords = _polarToCartesian(outterBevelRadius, endAngle + capSize), endInnerBevelCoords = _polarToCartesian(innerBevelRadius, endAngle + capSize), startOutterBevelCoords = _polarToCartesian(outterBevelRadius, startAngle - capSize), startInnerBevelCoords = _polarToCartesian(innerBevelRadius, startAngle - capSize), startOutterBevelBezierCoords = _polarToCartesian(outterBevelBezierRadius, startAngle - capSize), startInnerBevelBezierCoords = _polarToCartesian(innerBevelBezierRadius, startAngle - capSize), endOutterBevelBezierCoords = _polarToCartesian(outterBevelBezierRadius, endAngle + capSize), endInnerBevelBezierCoords = _polarToCartesian(innerBevelBezierRadius, endAngle + capSize), x1 = center + startCoords.x, x2 = center + endCoords.x, y1 = center + startCoords.y, y2 = center + endCoords.y, x3 = center + outerStartCoords.x, x4 = center + outerEndCoords.x, y3 = center + outerStartCoords.y, y4 = center + outerEndCoords.y;
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
    };
    return DonutChartPathGenerator;
}());
exports.DonutChartPathGenerator = DonutChartPathGenerator;
//# sourceMappingURL=donut-chart.js.map