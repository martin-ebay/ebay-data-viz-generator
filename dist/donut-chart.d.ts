interface portion {
    rawValue: string;
    value: number;
    percentage: number;
    text: string;
}
interface portions extends Array<portion> {
}
export declare class DonutChartPathGenerator {
    portions: portions;
    size: number;
    center: number;
    private total;
    private padding;
    private donutWidth;
    private corner;
    constructor(input: any);
    getPortionShape(percentage: any, startIndex: any): string;
    makeSectorShape(startAngle: any, angle: any): string;
}
export {};
