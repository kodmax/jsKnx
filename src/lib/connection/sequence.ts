type SequenceCounter = () => number

const sequence: () => SequenceCounter = () => {
    let seq = 255
    return () => {
        seq = seq + 1 & 0xff
        return seq
    }
}

export type { SequenceCounter }
export { sequence }
