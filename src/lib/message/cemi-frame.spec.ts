import { KnxCemiCode } from "../enums"
import { KnxCemiFrame } from "./cemi-frame"

describe("cEMI frame", () => {
    it("compose GroupValueWrite", () => {
        const frame = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Request, "1.2.3", "4/5/6", Buffer.from([0x3f, 1, 2, 3, 4]))
        expect(frame).toEqual(Buffer.from([0x11, 0x00, 0xbc, 0xe0, 0x12, 0x03, 0x25, 0x06, 0x05, 0x00, 0xbf, 0x01, 0x02, 0x03, 0x04]))
    })
    
    it("compose GroupValueWrite", () => {
        const frame = KnxCemiFrame.groupValueWrite(KnxCemiCode.L_Data_Request, "1.2.3", "4/5/6", Buffer.from([1, 1, 2, 3, 4]))
        expect(frame).toEqual(Buffer.from([0x11, 0x00, 0xbc, 0xe0, 0x12, 0x03, 0x25, 0x06, 0x05, 0x00, 0x81, 0x01, 0x02, 0x03, 0x04]))
    })

    it("compose GroupValueRead", () => {
        const frame = KnxCemiFrame.groupValueRead(KnxCemiCode.L_Data_Request, "1.2.3", "4/5/6")
        expect(frame).toEqual(Buffer.from([0x11, 0x00, 0xbc, 0xe0, 0x12, 0x03, 0x025, 0x06, 0x01, 0x00, 0x0]))
    })
})