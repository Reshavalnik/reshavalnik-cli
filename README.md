# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

# Reshavalnik Vue 3 – Migration Runbook (Replica of Angular app)

Goal: Vue 3 version that replicates the current Angular app behavior 1:1:
- routes: `/auth`, `/auth/callback`, `/panel`
- login / register
- social login + callback
- guard за `/panel`
- the same CSS
- the same API endpoints 

## Prerequisites
- Node.js (LTS recommended)
- npm
- Backend runs on: `http://localhost:8080`

## Quick start
### 1) Install
```bash
npm install

