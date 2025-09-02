// agent.js

class InspectorAgent {
    constructor() {
      this.commands = new Map();
      this.events = new Map();
      this.storage = null; // Будет подключен позже
    }
  
    // Регистрация команды
    registerCommand(name, handler) {
      this.commands.set(name, handler);
    }
  
    // Вызов команды
    async call(command, params = {}) {
      const handler = this.commands.get(command);
      if (!handler) {
        return { error: `Команда "${command}" не найдена` };
      }
  
      try {
        const result = await handler(params, this);
        return { result };
      } catch (error) {
        return { error: error.message };
      }
    }
  
    // Регистрация события
    on(event, handler) {
      this.events.set(event, handler);
    }
  
    // Триггер события
    async trigger(event, data) {
      const handler = this.events.get(event);
      if (handler) {
        return await handler(data, this);
      }
    }
  }
  
  module.exports = InspectorAgent;