class Lumis {
    constructor(database) {
      this.db = database.items;
      this.aliases = database.aliases_map || {};
      this.gosts = database.gosts || {};
      
      // Цвета и иконки групп
      this.colors = {
        G: '#3498db', P: '#2ecc71', E: '#b061ff',
        S: '#ffdd00', F: '#00f7ff', J: '#ffae00', Q: '#c1b8ff'
      };
  
      this.icons = {
        G: '📐', P: '🔨', E: '⚛️', S: '🖌️', F: '🔧', J: '🔗', Q: '?'
      };
    }
  
    get(query, filters = {}) {
      const key = this.aliases[query] || query;
      const item = this.db[key];
      if (!item) return { error: "Изделие не найдено", query };
  
      let instructions = this.generateInstructions(item);
  
      if (filters.normative) {
        instructions = instructions.filter(instr => {
          if (filters.normative === 'ГОСТ' && instr.source_gost.includes('ГОСТ')) return true;
          if (filters.normative === 'API' && instr.source_gost.includes('API')) return true;
          if (filters.normative === 'ISO' && instr.source_gost.includes('ISO')) return true;
          if (filters.normative === 'ASME' && instr.source_gost.includes('ASME')) return true;
          return false;
        });
      }
  
      if (filters.controlType) {
        if (filters.controlType === 'ВИК') {
          instructions = instructions.filter(instr => ['G', 'S', 'F', 'J'].includes(instr.group));
        }
      }
  
      instructions.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  
      return {
        id: item.id,
        name: item.name,
        category_kgs: item.category_kgs,
        type: item.type,
        instructions: instructions,
        standards: item.standards || []
      };
    }
  
    generateInstructions(item, selectedNormative, selectedControlType) {
      const allSteps = [];
      const usedStandards = item.standards || [];
    
      usedStandards.forEach(gostCode => {
        const gostData = this.gosts[gostCode];
        if (gostData?.instructions) {
          gostData.instructions.forEach(instr => {
            if (!instr.source || !instr.source.includes(selectedNormative)) return;
            if (!instr.control_types || !instr.control_types.includes(selectedControlType)) return;
    
            allSteps.push({
              ...instr,
              source_gost: gostCode
            });
          });
        }
      });
    
      allSteps.sort((a, b) => a.order - b.order);
      return allSteps;
    }
  
    generateChecklist(instructions, item, selectedNormative) {
      const extractValueByNormative = (valueStr, normative) => {
        if (!valueStr || !valueStr.includes('(')) return valueStr;
        
        const parts = valueStr.split(',').map(p => p.trim());
        for (let part of parts) {
          if (part.includes(`(${normative}`)) {
            return part.split('(')[0].trim();
          }
        }
        return parts[0].split('(')[0].trim();
      };
    
      const extractToleranceByNormative = (toleranceStr, normative) => {
        if (!toleranceStr || toleranceStr === "—") return toleranceStr;
        if (!toleranceStr.includes('(')) return toleranceStr;
        
        const parts = toleranceStr.split(',').map(p => p.trim());
        for (let part of parts) {
          if (part.includes(`(${normative}`)) {
            return part.split('(')[0].trim();
          }
        }
        return parts[0].split('(')[0].trim();
      };
    
      let html = `
        <div class="checklist">
          <h2 style="margin-top: 0; color: #2c3e50;">📋 Чек-лист</h2>
          <h3 style="color: #2c3e50; margin: 5px 0;">${item.name}</h3>
          <div style="color: #7f8c8d; margin-bottom: 15px;">Категория: ${item.category_kgs} | ID: ${item.id}</div>
      `;
    
      html += `
          <div class="progress-bar">
          <div id="progress-fill" class="progress-fill" style="width: 0%; background: #2ecc71;"></div>
          </div>
      `;
    
      html += `<h3>📋 Контролируемые параметры:</h3>`;
    
      instructions.forEach((instr, idx) => {
        const color = this.colors[instr.index] || '#95a5a6';
        const displayValue = extractValueByNormative(instr.value, selectedNormative);
        const displayTolerance = extractToleranceByNormative(instr.tolerance, selectedNormative);
    
        html += `
        <div class="param-row" onclick="toggleCheckbox(${idx}, ${instructions.length})" style="border-left-color: ${color};">
        <input type="checkbox" id="checkbox-${idx}" class="checkbox" onclick="event.stopPropagation();">
        <strong>${idx + 1}.<span style="font-size: 0em">[${instr.index}]</span> ${displayValue}</strong>
        ${displayTolerance && displayTolerance !== "—" ? `<span style="color: green; font-size: 17;"> (${displayTolerance})</span>` : ''}
      </div>
        `;
      });
    
      html += `<h3>🔊 Инструкции по шагам:</h3>`;
    
      instructions.forEach((instr, idx) => {
        const displayValue = extractValueByNormative(instr.value, selectedNormative);
        const displayTolerance = extractToleranceByNormative(instr.tolerance, selectedNormative);
    
        html += `
          <div class="step-header" onclick="toggleStep(${idx})">
            Шаг ${idx + 1}
            
          </div>
          <div id="step-content-${idx}" class="step-content">
          <button class="speak-btn" onclick="event.stopPropagation(); speakInstruction(${idx + 1}, \`${instr.description.replace(/`/g, "\\`").replace(/\n/g, " ")}\`)">🎧</button>
            <p><strong>Параметр:</strong> [${instr.index}] ${displayValue}</p>
            ${displayTolerance && displayTolerance !== "—" ? `<p><strong>Допуск:</strong> ${displayTolerance}</p>` : ''}
            <p><strong>Метод контроля:</strong> ${instr.description}</p>
            <em>Источник: <strong>${this.gosts[instr.source_gost]?.icon || '❓'} ${instr.source_gost}</strong></em>
          </div>
        `;
      });
    
      html += `
          <div class="used-gosts">
            <h3>📚 Использованные нормативы:</h3>
            <ul>
      `;
    
      const uniqueGOSTs = [...new Set(item.standards || [])];
      uniqueGOSTs.forEach(gost => {
        const gostData = this.gosts[gost] || {};
        const icon = gostData.icon || '❓';
        html += `<li><strong>${icon} ${gost}</strong> — ${gostData.entity || ''} (${gostData.rank || ''})</li>`;
      });
    
      html += `
            </ul>
          </div>
        </div>
      `;
    
      return html;
    }
  
    visualizeGOSTs(itemKey = null) {
      const gostSky = document.getElementById('gost-sky');
      if (!gostSky) return;
    
      const allGOSTs = new Set();
      Object.values(this.db).forEach(item => {
        if (item.standards && Array.isArray(item.standards)) {
          item.standards.forEach(gost => {
            if (gost) allGOSTs.add(gost);
          });
        }
      });
    
      const activeGOSTs = new Set();
      if (itemKey) {
        const item = this.db[this.aliases[itemKey] || itemKey];
        if (item && item.standards && Array.isArray(item.standards)) {
          item.standards.forEach(gost => {
            if (gost) activeGOSTs.add(gost);
          });
        }
      }
    
      gostSky.innerHTML = '';
      console.log("Очистили gost-sky. Всего ГОСТов:", allGOSTs.size, "Активных:", activeGOSTs.size);
      const sortedGOSTs = [...allGOSTs].sort((a, b) => {
        const aActive = activeGOSTs.has(a);
        const bActive = activeGOSTs.has(b);
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return 0;
      });
    
      sortedGOSTs.forEach(gost => {
        const tile = document.createElement('div');
        tile.className = activeGOSTs.has(gost) ? 'gost-tile active' : 'gost-tile inactive';
        const gostData = this.gosts[gost] || {};
        const icon = gostData.icon || '❓';
        tile.innerHTML = `<span>${icon}</span> ${gost}`;
        tile.title = activeGOSTs.has(gost) ? "Активен в текущем изделии" : "Не используется сейчас";
    
        tile.onclick = () => {
          alert(`ℹ️ ${gost}\n${this.gosts[gost]?.description || 'Описание отсутствует'}`);
        };
    
        gostSky.appendChild(tile);
      });
      console.log("✅ Плитки отрисованы.");
    }
  
    generateWebGLColorSignature(initialGroups = []) {   
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 80;
    
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        canvas.style.backgroundColor = '#333';
        return canvas;
      }
    
      const vsSource = `
        attribute vec2 a_position;
        varying vec2 vUv;
        void main() {
          vUv = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;
    
      const fsSource = `
        precision highp float;
        uniform float u_time;
        uniform int u_activeCount;
        uniform vec3 u_colors[7];
        uniform float u_activations[7];
        varying vec2 vUv;
    
        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
    
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = rand(i);
          float b = rand(i + vec2(1.0, 0.0));
          float c = rand(i + vec2(0.0, 1.0));
          float d = rand(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
    
        void main() {
          vec2 uv = vUv * 4.0;
          float baseNoise = noise(uv + vec2(u_time * 0.2)) * 0.5 + 0.5;
          baseNoise += noise(uv * 2.0 + vec2(-u_time * 0.1)) * 0.25;
          baseNoise += noise(uv * 4.0 + vec2(u_time * 0.3)) * 0.125;
          baseNoise = clamp(baseNoise, 0.0, 1.0);
    
          vec3 finalColor = vec3(0.0);
    
          for (int i = 0; i < 7; i++) {
            if (i >= u_activeCount) break;
            float activation = u_activations[i];
            if (activation > 0.0) {
              vec2 offset = vec2(float(i) * 0.3, float(i) * 0.7);
              float n = noise(uv * 1.5 + offset + vec2(u_time * 0.05 * float(i+1)));
              n = smoothstep(0.4, 0.8, n);
              finalColor += u_colors[i] * n * activation;
            }
          }
    
          if (u_activeCount == 0 || finalColor == vec3(0.0)) {
            finalColor = vec3(baseNoise * 0.3);
          }
    
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;
    
      const compileShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compile error:', gl.getShaderInfoLog(shader));
          return null;
        }
        return shader;
      };
    
      const vs = compileShader(gl.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) {
        canvas.style.backgroundColor = '#e74c3c';
        return canvas;
      }
    
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        canvas.style.backgroundColor = '#e74c3c';
        return canvas;
      }
    
      gl.useProgram(program);
    
      const positions = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
      const positionLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    
      const timeLoc = gl.getUniformLocation(program, 'u_time');
      const activeCountLoc = gl.getUniformLocation(program, 'u_activeCount');
      const colorsLoc = gl.getUniformLocation(program, 'u_colors');
      const activationsLoc = gl.getUniformLocation(program, 'u_activations');
    
      const groupKeys = ['G', 'P', 'E', 'S', 'F', 'J', 'Q'];
      const groupToIndex = {};
      groupKeys.forEach((key, idx) => groupToIndex[key] = idx);
    
      const activations = new Float32Array(7).fill(0);
      const colorsArray = new Float32Array(21);
    
      groupKeys.forEach((key, i) => {
        const hex = this.colors[key] || '#95a5a6';
        colorsArray[i*3] = parseInt(hex.slice(1, 3), 16) / 255;
        colorsArray[i*3+1] = parseInt(hex.slice(3, 5), 16) / 255;
        colorsArray[i*3+2] = parseInt(hex.slice(5, 7), 16) / 255;
        if (initialGroups.includes(key)) {
          activations[i] = 1.0;
        }
      });
    
      gl.uniform3fv(colorsLoc, colorsArray);
      gl.uniform1i(activeCountLoc, groupKeys.length);
    
      canvas.updateActivations = (activeGroups) => {
        activations.fill(0);
        activeGroups.forEach(group => {
          if (groupToIndex[group] !== undefined) {
            activations[groupToIndex[group]] = 1.0;
          }
        });
        gl.uniform1fv(activationsLoc, activations);
      };
    
      canvas.updateActivations(initialGroups);
    
      const render = () => {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(timeLoc, performance.now() / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
      };
    
      render();
    
      return canvas;
    }
  }
  
  // ❗️ НИЧЕГО НЕ ИНИЦИАЛИЗИРУЕМ ЗДЕСЬ!
  // Экспортируем класс для использования снаружи
  window.Lumis = Lumis;