import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import vine from '@vinejs/vine'

export default class TestValidation extends BaseCommand {
  static commandName = 'test:validation'
  static description = 'Test VineJS validation'

  static options: CommandOptions = {
    startApp: false,
  }

  async run() {
    this.logger.info('🧪 Testing VineJS validation...')

    const testSchema = vine.compile(
      vine.object({
        name: vine.string().minLength(2),
        url: vine.string().url(),
      })
    )

    // Test 1 - Données valides
    this.logger.info('\n✅ Test 1 - Valid data:')
    try {
      const valid = await testSchema.validate({
        name: 'Dev.to',
        url: 'https://dev.to',
      })
      this.logger.success('Validation passed!')
      console.log(valid)
    } catch (error) {
      this.logger.error('Validation failed:', error.messages)
    }

    // Test 2 - Données invalides
    this.logger.info('\n❌ Test 2 - Invalid data:')
    try {
      const invalid = await testSchema.validate({
        name: 'D',
        url: 'not-a-url',
      })
      this.logger.success('Validation passed!')
      console.log(invalid)
    } catch (error) {
      this.logger.error('Validation failed (expected):')
      console.log(error.messages)
    }

    this.logger.info('\n✨ Tests completed!')
  }
}
