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
    TUNNELING_LAYER = 0x29

    // CONNSTATE_LOST = 0x15, // eibd/libserver/eibnetserver.cpp:394
}

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

  export enum KnxConnectionType {
    DEVICE_MGMT_CONNECTION = 0x03,
    TUNNEL_CONNECTION = 0x04,
    REMOTE_LOGGING_CONNECTION = 0x06,
    REMOTE_CONFIGURATION_CONNECTION = 0x07,
    OBJECT_SERVER_CONNECTION = 0x08,
  }

  export enum KnxServiceId {
    SEARCH_REQUEST = 0x0201,
    SEARCH_RESPONSE = 0x0202,
    DESCRIPTION_REQUEST = 0x0203,
    DESCRIPTION_RESPONSE = 0x0204,
    CONNECTION_REQUEST = 0x0205,
    CONNECTION_RESPONSE = 0x0206,
    CONNECTIONSTATE_REQUEST = 0x0207,
    CONNECTIONSTATE_RESPONSE = 0x0208,
    DISCONNECT_REQUEST = 0x0209,
    DISCONNECT_RESPONSE = 0x020a,
    TUNNEL_REQUEST = 0x0420,
    TUNNEL_RESPONSE = 0x0421,
    DEVICE_CONFIGURATION_REQUEST = 0x0310,
    DEVICE_CONFIGURATION_ACK = 0x0311,
    ROUTING_INDICATION = 0x0530,
}

export enum KnxIpProtocol {
  IPV4_UDP = 0x01,
  IPV4_TCP = 0x02
};

export enum DPT {
  Switch = '1.001',
  Bool = '1.002',
  Enable = '1.003',
  UpDown = '1.008',
  OpenClose = '1.009',
  Reset = '1.015',
  Ack = '1.016',
  Trigger = '1.017',
  Occupancy = '1.018',
  Window_Door = '1.019',
  DayNight = '1.024',

  Value_Power = '14.056',

  Value_Temp = '9.001',
  Value_Humidity = '9.007',
  Value_AirQuality = '9.008',

  ActiveEnergy = '13.010',
}

export enum KnxMessageCode {
    'L_Raw.req' = 0x10,
    'L_Data.req' = 0x11,
    'L_Poll_Data.req' = 0x13,
    'L_Poll_Data.con' = 0x25,
    'L_Data.ind' = 0x29,
    'L_Busmon.ind' = 0x2b,
    'L_Raw.ind' = 0x2d,
    'L_Data.con' = 0x2e,
    'L_Raw.con' = 0x2f
}