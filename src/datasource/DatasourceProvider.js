export class DatasourceProvider {

    constructor(name) {
        this.name = name;
    }

    getDatasource = () => {
        throw Error("not implemented");
    };
}
