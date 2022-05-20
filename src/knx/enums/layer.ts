export enum KnxLayer {
    /**
     * Tunneling on link layer, establishes a link layer tunnel to the KNX network.
     */
    LINK_LAYER = 0x02,

    /**
     * Tunneling on raw layer, establishes a raw tunnel to the KNX network.
     */
    RAW_LAYER = 0x04,

    /**
     * Tunneling on busmonitor layer, establishes a busmonitor tunnel to the KNX network.
     */
    BUSMONITOR_LAYER = 0x80
}