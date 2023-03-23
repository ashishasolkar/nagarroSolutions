export class Helper {

    public static IsNotNumber(value: string, locale?: string): boolean {
        // return isNaN(this.ParseNumber(value, ))
        //   ? `${value} is not a valid number.`//`${strings.InvalidNumberValue} ${value}`
        //   : '';
        return isNaN(this.ParseNumber(value,));
    }

    private static ParseNumber(value: string, locale = navigator.language) {
        const decimalSperator = Intl.NumberFormat(locale).format(1.1).charAt(1);
        // const cleanPattern = new RegExp(`[^-+0-9${ example.charAt( 1 ) }]`, 'g');
        const cleanPattern = new RegExp(`[${'\' ,.'.replace(decimalSperator, '')}]`, 'g');
        const cleaned = value.replace(cleanPattern, '');
        const normalized = cleaned.replace(decimalSperator, '.');
        return Number(normalized);
    }

    public static IsEmptyOrNull(val: any): boolean {
        return (val == undefined || val == null || val == "");
    }
}