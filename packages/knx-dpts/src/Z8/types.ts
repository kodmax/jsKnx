export type KnxStandardStatus = {
    /**
     * corresponding Datapoint value is out of service
     */
    OutOfService: boolean

    /**
     * corresponding Datapoint Main value is corrupted due to a failure
     */
    Fault: boolean

    /**
     * corresponding Datapoint Main value is overridden
     */
    Overridden: boolean

    /**
     * alarm status of corresponding Datapoint is not acknowledged
     */
    AlarmUnAck: boolean

    /**
     * corresponding Datapoint is in alarm
     */
    InAlarm: boolean
}
