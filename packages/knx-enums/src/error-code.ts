export enum KnxErrorCode {
    /**
     * Operation successful.
     */
    NO_ERROR = 0x00,

    /**
     * The requested type of host protocol is not supported by the device.
     */
    HOST_PROTOCOL_TYPE = 0x01,

    /**
     * The requested protocol version is not supported by the device.
     */
    VERSION_NOT_SUPPORTED = 0x02,

    /**
     * The received sequence number is out of order.
     */
    SEQUENCE_NUMBER = 0x04,

    /**
     * The server device could not find an active data connection with the specified ID.
     */
    CONNECTION_ID = 0x21,

    /**
     * The server does not support the requested connection type.
     */
    CONNECTION_TYPE = 0x22,

    /**
     * The server does not support the requested connection options.
     */
    CONNECTION_OPTION = 0x23,

    /**
     * The server could not accept a new connection, maximum reached.
     */
    NO_MORE_CONNECTIONS = 0x24,

    /**
     * The server could not accept a new connection, out of channels
     */
    NO_MORE_CHANNELS = 0x25,

    /**
     * The server detected an error concerning the data connection with the specified ID.
     */
    DATA_CONNECTION = 0x26,

    /**
     * The server detected an error concerning the KNX subsystem connection with the specified ID.
     */
    KNX_CONNECTION = 0x27,

    /**
     * The requested tunneling layer is not supported by the server.
     */
    TUNNELING_LAYER = 0x29,

    // CONNSTATE_LOST = 0x15, // eibd/libserver/eibnetserver.cpp:394

    /**
     * Error code is not recognized.
     */
    UNKNOWN_ERROR = 0xff
}
