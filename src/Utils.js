
export default class Utils {

    static rounded = num => {
        if(isNaN(num)) {
            return "-";
        }
        if (num > 1000000000) {
            return Math.round(num / 100000000) / 10 + "Bn";
        } else if (num > 1000000) {
            return Math.round(num / 100000) / 10 + "M";
        } else if (num > 1000) {
            return Math.round(num / 100) / 10 + "K";
        } else {
            return Math.round(num);
        }
    };
}
