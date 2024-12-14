import { pgTable, serial, varchar, boolean, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar().notNull(),
	email: varchar().notNull(),
	imageUrl: varchar(),
	subscription: boolean().default(false),
});

export const videoData = pgTable("videoData", {
	id: serial().primaryKey().notNull(),
	script: json().notNull(),
	audioFileUrl: varchar().notNull(),
	captions: json().notNull(),
	imageList: varchar().array(),
	createdBy: varchar().notNull(),
});
