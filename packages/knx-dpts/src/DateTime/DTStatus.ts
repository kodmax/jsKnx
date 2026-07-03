export enum DTStatus {
    /** Faulty */
    F = 0x8000,
    /** Working day / Bank holiday */
    WD = 0x4000,
    /** Working day not valid */
    NWD = 0x2000,
    /** Year not valid */
    NY = 0x1000,
    /** Month and day of months not valid */
    ND = 0x0800,
    /** Day of week not valid */
    NDoW = 0x0400,
    /** Hour, minute and second not valid */
    NT = 0x0200,
    /** Daylight saving time UT+X+1 */
    SUTI = 0x0100,
    /** Is external sync clock */
    CLQ = 0x0080,
    /** Is reliable */
    SRC = 0x0040
}
