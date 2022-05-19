export class KnxMessage {
    public constructor(private readonly frame: Buffer) {

    }

    public dump(prefix: string): void {
        console.log(prefix, this.frame)
    }
}