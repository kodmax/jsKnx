type SequenceCounter = () => number

const sequence: (max: number) => SequenceCounter = max => {
    let seq = -1
    ++max

    return () => {
        seq = (seq + 1) % max
        return seq
    }
}

export type { SequenceCounter }
export { sequence }
