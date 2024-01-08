type SizeOption = {
    winW: number;
    winH: number;
    beforeW: number;
    aspect?: number;
};

type BoolItem = {
    isMatchMediaWidth: boolean;
    isMatchMediaHover: boolean;
    isPc: boolean;
    isIPhone: boolean | undefined;
    isAndroid: boolean | undefined;
    isDev: boolean;
};

type Props = {
    isMatchMediaWidth: boolean;
    winW: number;
    winH: number;
    aspect: number;
    longer: number;
    shorter: number;
};

type CameraOption = {
    width: number;
    height: number;
    near: number;
    far: number;
    position: Partial<Vector3>;
};

type ShaderProgramOption = {
    vsSource: string;
    fsSource: string;
    attribute: string[];
    stride: number[];
    uniform?: string[];
    type?: (UniformType | UniformMatrixType)[];
};

type UniformType =
    | 'uniform1f'
    | 'uniform1i'
    | 'uniform1iv'
    | 'uniform2fv'
    | 'uniform2iv'
    | 'uniform3fv'
    | 'uniform3iv'
    | 'uniform4fv'
    | 'uniform4iv';

type UniformMatrixType = 'uniformMatrix2fv' | 'uniformMatrix3fv' | 'uniformMatrix4fv';
