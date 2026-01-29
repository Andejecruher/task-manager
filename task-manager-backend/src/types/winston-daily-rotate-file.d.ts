declare module 'winston-daily-rotate-file' {
    import TransportStream from 'winston-transport';

    interface DailyRotateFileOptions extends TransportStream.TransportStreamOptions {
        filename?: string;
        datePattern?: string;
        zippedArchive?: boolean;
        maxSize?: string | number;
        maxFiles?: string | number;
        level?: string;
        [key: string]: any;
    }

    const DailyRotateFile: new (opts?: DailyRotateFileOptions) => TransportStream;
    export default DailyRotateFile;
}
