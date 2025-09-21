# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ESLint plugin that enforces correct pino logger usage patterns. The plugin helps developers avoid common mistakes when using the pino logging library by ensuring object arguments come before message strings in logging method calls.

## Common Commands

- **Test**: `npm test` - Runs Jest tests located in `tests/` directory
- **Build**: `npm run build` - Uses tsup to build CJS/ESM distributions with TypeScript declarations
- **Lint**: `npm run lint` - Lints TypeScript files in `src/` directory
- **Test a single rule**: `npm test -- --testNamePattern="correct-args-position"`

## Architecture

### Core Structure
- **Entry point**: `src/index.ts` - Exports plugin configuration with rules and recommended config
- **Rules directory**: `src/rules/` - Contains individual ESLint rule implementations
- **Tests**: `tests/rules/` - Mirror structure of `src/rules/` for test files

### ESLint Plugin Architecture
The plugin follows standard ESLint plugin patterns:
- Each rule is a separate module exporting a `Rule.RuleModule` object
- Rules include meta information (docs, fixable, schema, messages) and a create function
- The main plugin exports rules and configurations (including a "recommended" config)

### Rule Implementation Pattern
Rules in this codebase use TypeScript with ESTree AST node types and follow this pattern:
1. Define constants for method names and patterns
2. Implement helper functions for AST node identification
3. Create rule listeners that traverse specific node types
4. Include auto-fix functionality when applicable

### Current Rules
- **correct-args-position**: Enforces that pino logger methods have object arguments before message strings. Includes sophisticated logger detection logic to avoid false positives with console.log and other non-pino loggers.

## Development Notes

- Uses TypeScript with strict mode enabled
- Built with tsup for dual CJS/ESM output 
- Jest with ts-jest for testing
- Target: ES2020, Node.js >=14.0.0
- The codebase is conservative about logger detection to minimize false positives