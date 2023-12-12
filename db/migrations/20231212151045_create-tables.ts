import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.timestamp('date_time').notNullable()
    table.boolean('diet').notNullable()
    table.uuid('user_id').index()
  })

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.text('username').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')

  await knex.schema.dropTable('users')
}
