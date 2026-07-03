describe('KnxReading type usage', () => {
    it('allows typed value payloads', () => {
        const reading = {
            target: '1/2/3',
            source: '1.1.1',
            text: '42',
            unit: '',
            value: 42
        }

        expect(reading.value).toBe(42)
    })
})
