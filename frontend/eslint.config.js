import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint' // <--- لازم يكون عندك هذا

export default tseslint.config(
  { ignores: ['dist'] },
  {
    // ✅ تحديث الـ files ليشمل TypeScript
    files: ['**/*.{ts,tsx,js,jsx}'], 
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended, // ✅ إضافة قواعد TypeScript
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      // ✅ إخبار ESLint بكيفية قراءة TypeScript
      parser: tseslint.parser, 
      parserOptions: {
        project: ['./tsconfig.json'], // يربط ESLint بملف الإعدادات اللي عملناه
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // ✅ القاعدة متاعك مريڨلة لكن للـ TS نستخدم نسخة '@typescript-eslint'
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-unused-vars': 'off', // نغلق النسخة العادية باش ما تضربش مع TS
    },
  },
)