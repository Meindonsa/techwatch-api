// config/vine.ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  // Messages d'erreur en français
  required: 'Le champ {{ field }} est obligatoire',
  string: 'Le champ {{ field }} doit être une chaîne de caractères',
  email: 'Le champ {{ field }} doit être une adresse email valide',
  minLength: 'Le champ {{ field }} doit contenir au moins {{ min }} caractères',
  maxLength: 'Le champ {{ field }} ne peut pas dépasser {{ max }} caractères',
  url: 'Le champ {{ field }} doit être une URL valide',
  number: 'Le champ {{ field }} doit être un nombre',
  min: 'Le champ {{ field }} doit être au moins {{ min }}',
  max: 'Le champ {{ field }} ne peut pas dépasser {{ max }}',
  confirmed: 'Le champ {{ field }} ne correspond pas',
  enum: 'La valeur sélectionnée pour {{ field }} est invalide',
  boolean: 'Le champ {{ field }} doit être vrai ou faux',
})
