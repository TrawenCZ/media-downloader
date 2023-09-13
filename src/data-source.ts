import "reflect-metadata"
import { DataSource } from "typeorm"
import { DownloadEntry } from "./entity/DownloadEntry"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [DownloadEntry],
    migrations: [],
    subscribers: [],
})
