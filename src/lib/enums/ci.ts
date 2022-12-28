export enum CemiPacketType {
    Control = 0x1,
    Data = 0x0
}

export enum CemiSequenceType {
    Unsequenced = 0x0,
    Sequenced = 0x1
}

/**
 * 4 bits
 * byte 9 of cEMI frame, bits 1,0
 * byte 10 of cEMI frame, bits 7,6
 * ......?? ??......
 */
export enum APCI {
    APCI_GROUP_VALUE_READ = 0, // # Multicast.
    APCI_GROUP_VALUE_RESP = 1,
    APCI_GROUP_VALUE_WRITE = 2,

    APCI_INDIVIDUAL_ADDRESS_WRITE = 3, // # Broadcast.
    APCI_INDIVIDUAL_ADDRESS_READ = 4,
    APCI_INDIVIDUAL_ADDRESS_RESP = 5,

    APCI_ADC_READ = 6, // # P2P-Connection-Oriented.
    APCI_ADC_RESP = 7,
    APCI_MEMORY_READ = 8,
    APCI_MEMORY_RESP = 9,
    APCI_MEMORY_WRITE = 10,

    APCI_USER_MSG = 11, // # User-defined Messages.

    APCI_DEVICE_DESCRIPTOR_READ = 12, // # P2P-Conection-Less.
    APCI_DEVICE_DESCRIPTOR_RESP = 13,

    APCI_RESTART = 14, // # P2P-Connection-Oriented.

    APCI_ESCAPE = 15, // # Others, escape.
}
