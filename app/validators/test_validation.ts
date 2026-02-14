import vine from '@vinejs/vine'

const testSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(2),
    url: vine.string().url(),
  })
)

console.log('🧪 Test 1 - Données valides:')
testSchema
  .validate({ name: 'Dev.to', url: 'https://dev.to' })
  .then((data) => console.log('✅ Succès:', data))
  .catch((error) => console.log('❌ Erreur:', error.messages))

console.log('\n🧪 Test 2 - Données invalides:')
testSchema
  .validate({ name: 'D', url: 'not-a-url' })
  .then((data) => console.log('✅ Succès:', data))
  .catch((error) => console.log('❌ Erreur:', error.messages))
