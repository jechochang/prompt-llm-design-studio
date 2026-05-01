(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const fields = [
    'designTask','projectType','theme','site','designIntent','coreTemplate','referenceMode','extractedCues','negativePrompt',
    'section1','section2','section3','aspectRatio','layoutDirection','annotationDensity','diagramRatio','stylePreset',
    'renderMethod','materials','spatialFeatures','quality','chaos','stylize','cfg'
  ];

  const i18n = {
    zh: {
      appTitle:'設計圖板 Prompt 工具', appSubtitle:'Studio Poster v2：一站式視覺化設計驅動引擎',
      navProject:'01 專案設定', navReference:'02 參考圖與抽象轉譯', navBoard:'03 圖板結構', navStyle:'04 風格與參數', navPrompt:'05 Prompt 輸出', navHistory:'06 歷史生成',
      contractText:'輸出包含：短版 Prompt、完整 Prompt、負面 Prompt、JSON 規格與 Midjourney/SDXL 參數。',
      heroTitle:'AI 建築／室內／景觀圖板 Prompt 生成器', heroText:'將概念來源、設計任務、圖板分區、材料、風格、參數與限制條件整合成可直接用於 GPT、Gemini、Midjourney、SDXL、ComfyUI 或其他多模態模型的專業提示詞。',
      generate:'生成 Prompt', copyFull:'複製完整 Prompt', downloadJson:'下載 JSON', downloadTxt:'下載 TXT', projectSettings:'專案設定', designTask:'設計任務名稱', projectType:'專案類型', theme:'設計主題', site:'基地／場域', designIntent:'設計意圖描述',
      templatePreview:'圖板模板預覽', coreTemplate:'核心模板', referenceTitle:'02 參考圖與抽象轉譯', imageUpload:'參考圖上傳與標註', imageHint:'可上傳多張概念參考圖。工具只保留本機預覽，不會上傳伺服器。', referenceMode:'參考圖使用方式', extractedCues:'抽取特徵關鍵字', transformationRules:'轉譯規則與禁止事項', negativePrompt:'負面 Prompt 補充',
      boardTitle:'03 圖板結構與內容模組', sections:'圖板分區', mustInclude:'必須包含元素', layoutSettings:'版面設定', aspectRatio:'比例', layoutDirection:'構圖方向', annotationDensity:'標註密度', diagramRatio:'圖解比例', styleTitle:'04 風格、材料與生成參數', visualStyle:'視覺風格', stylePreset:'風格預設', renderMethod:'表現方式', materiality:'材料與空間特徵', materials:'主要材料', spatialFeatures:'空間／立面特徵', generationParams:'生成參數', promptTitle:'05 Prompt 輸出', statusReady:'已就緒：可生成 Prompt', saveHistory:'儲存到歷史生成', reset:'重設範例', fullPrompt:'完整 Prompt', jsonSpec:'JSON 規格', historyTitle:'06 歷史生成區', historyList:'歷史版本', historyHint:'點擊歷史版本可重新載入當時的參數狀態。資料儲存在瀏覽器 localStorage。', workflowExport:'工作流輸出', workflowText:'本工具可作為 AI Studio / Vibe Coding 專題的前端 prompt generator 原型，支援下拉式選單、滑桿、歷史生成、JSON 輸出與雙語 UI。'
    },
    en: {
      appTitle:'Design Board Prompt Tool', appSubtitle:'Studio Poster v2: Visual design-driven prompt engine',
      navProject:'01 Project', navReference:'02 Reference Translation', navBoard:'03 Board Structure', navStyle:'04 Style & Parameters', navPrompt:'05 Prompt Output', navHistory:'06 History',
      contractText:'Outputs include short prompt, full prompt, negative prompt, JSON specification, and Midjourney/SDXL parameters.',
      heroTitle:'AI Architecture / Interior / Landscape Board Prompt Generator', heroText:'Integrates concept sources, design task, board sections, materials, style, parameters, and constraints into professional prompts for GPT, Gemini, Midjourney, SDXL, ComfyUI, and multimodal models.',
      generate:'Generate Prompt', copyFull:'Copy Full Prompt', downloadJson:'Download JSON', downloadTxt:'Download TXT', projectSettings:'Project Settings', designTask:'Design Task', projectType:'Project Type', theme:'Design Theme', site:'Site / Context', designIntent:'Design Intent',
      templatePreview:'Board Template Preview', coreTemplate:'Core Template', referenceTitle:'02 Reference & Abstract Translation', imageUpload:'Reference Image Upload', imageHint:'Images are previewed locally only and are not uploaded.', referenceMode:'Reference Mode', extractedCues:'Extracted Cues', transformationRules:'Transformation Rules', negativePrompt:'Negative Prompt',
      boardTitle:'03 Board Structure & Modules', sections:'Board Sections', mustInclude:'Must Include', layoutSettings:'Layout Settings', aspectRatio:'Aspect Ratio', layoutDirection:'Layout Direction', annotationDensity:'Annotation Density', diagramRatio:'Diagram Ratio', styleTitle:'04 Style, Materiality & Generation Parameters', visualStyle:'Visual Style', stylePreset:'Style Preset', renderMethod:'Rendering Method', materiality:'Materiality & Spatial Features', materials:'Primary Materials', spatialFeatures:'Spatial / Facade Features', generationParams:'Generation Parameters', promptTitle:'05 Prompt Output', statusReady:'Ready: generate prompt', saveHistory:'Save to History', reset:'Reset Example', fullPrompt:'Full Prompt', jsonSpec:'JSON Spec', historyTitle:'06 History', historyList:'Saved Versions', historyHint:'Click a saved version to restore its parameters. Data is stored in browser localStorage.', workflowExport:'Workflow Export', workflowText:'This tool works as an AI Studio / Vibe Coding prompt generator prototype with dropdowns, sliders, history, JSON output, and bilingual UI.'
    }
  };

  function val(id){ const el=$(id); return el ? el.value : ''; }
  function checked(selector){ return $$(selector).filter(x=>x.checked).map(x=>x.value); }

  function collectState(){
    const state = {};
    fields.forEach(id => { state[id] = val(id); });
    state.rules = checked('.rule');
    state.includes = checked('.include');
    state.timestamp = new Date().toISOString();
    return state;
  }

  function applyState(state){
    if(!state) return;
    fields.forEach(id => { if($(id) && state[id] !== undefined) $(id).value = state[id]; });
    if(Array.isArray(state.rules)) $$('.rule').forEach(x => x.checked = state.rules.includes(x.value));
    if(Array.isArray(state.includes)) $$('.include').forEach(x => x.checked = state.includes.includes(x.value));
    updateSliderLabels();
    generate();
  }

  function buildPrompt(state){
    const includes = state.includes.join(', ');
    const rules = state.rules.map(x => '- ' + x).join('\n');
    const mj = `--ar ${state.aspectRatio.includes('16:9') ? '16:9' : state.aspectRatio.includes('9:16') ? '9:16' : state.aspectRatio.includes('1:1') ? '1:1' : '3:4'} --chaos ${state.chaos} --stylize ${state.stylize}`;

    const shortPrompt = `Professional competition-grade architectural presentation board for ${state.projectType}. Theme: ${state.theme}. ${state.stylePreset}. ${state.renderMethod}. ${state.aspectRatio}. ${state.layoutDirection}.`;

    const fullPrompt = `[Project Overview]\n- Design Task: ${state.designTask}\n- Project Type: ${state.projectType}\n- Design Theme: ${state.theme}\n- Site Location: ${state.site}\n- Core Template: ${state.coreTemplate}\n- Presentation Direction: professional, creative, competition-grade architectural presentation board\n- Layout Direction: ${state.layoutDirection}\n\n[Design Intent]\n${state.designIntent}\n\n[Concept Reference Analysis]\n- Reference Mode: ${state.referenceMode}\n- Extracted Cues: ${state.extractedCues}\n- Translate abstract cues into architecture, spatial language, facade rhythm, material articulation, lighting strategy, structural expression, and formal strategy.\n\n[Transformation Rules]\n${rules}\n\n[Board Layout Requirements]\n- Section 1: ${state.section1}\n- Section 2: ${state.section2}\n- Section 3: ${state.section3}\n- Must Include: ${includes}\n- Annotation Density: ${state.annotationDensity}/10\n- Diagram Ratio: ${state.diagramRatio}/10\n\n[Visual Style]\n- Style: ${state.stylePreset}\n- Render Method: ${state.renderMethod}\n- Materials: ${state.materials}\n- Spatial / Facade Features: ${state.spatialFeatures}\n- Quality: ${state.quality}\n\n[Output Requirements]\nCreate a refined, high-resolution, presentation-ready board with bilingual English and Traditional Chinese annotations, clean visual hierarchy, premium typography, clear diagrams, and professional architectural storytelling.\n\n[Negative Prompt]\n${state.negativePrompt}\n\n[Midjourney Parameters]\n${mj}\n\n[SDXL Parameters]\nCFG Scale: ${state.cfg}, high resolution, clean composition`;

    return { shortPrompt, fullPrompt, negativePrompt: state.negativePrompt, midjourney: mj };
  }

  function generate(){
    const state = collectState();
    const output = buildPrompt(state);
    const spec = { project: state, output };
    if($('fullPromptOutput')) $('fullPromptOutput').textContent = output.fullPrompt;
    if($('jsonOutput')) $('jsonOutput').textContent = JSON.stringify(spec, null, 2);
    if($('statusText')) $('statusText').textContent = 'Prompt 已生成 / Prompt generated';
    return spec;
  }

  async function copyFull(){
    const text = $('fullPromptOutput')?.textContent || generate().output.fullPrompt;
    try { await navigator.clipboard.writeText(text); if($('statusText')) $('statusText').textContent='已複製完整 Prompt / Copied'; }
    catch(e){ if($('statusText')) $('statusText').textContent='無法自動複製，請手動選取文字'; }
  }

  function download(filename, text, type='text/plain'){
    const blob = new Blob([text], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function saveHistory(){
    const spec = generate();
    const list = JSON.parse(localStorage.getItem('studioPosterHistory') || '[]');
    list.unshift({ id: Date.now(), title: spec.project.designTask || 'Untitled', theme: spec.project.theme, savedAt: new Date().toLocaleString(), state: spec.project });
    localStorage.setItem('studioPosterHistory', JSON.stringify(list.slice(0,30)));
    renderHistory();
  }

  function renderHistory(){
    const box = $('historyList'); if(!box) return;
    const list = JSON.parse(localStorage.getItem('studioPosterHistory') || '[]');
    box.innerHTML = '';
    if(!list.length){ box.innerHTML = '<div class="notice">尚無歷史版本 / No saved versions yet.</div>'; return; }
    list.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.savedAt)}</span><br><span>${escapeHtml(item.theme || '')}</span>`;
      div.addEventListener('click', () => applyState(item.state));
      box.appendChild(div);
    });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function updateSliderLabels(){
    ['annotationDensity','diagramRatio','chaos','stylize','cfg'].forEach(id => { const el=$(id), out=$(id+'Val'); if(el && out) out.textContent = el.value; });
  }

  function handleImages(){
    const input = $('imageUpload'), list = $('imageList');
    if(!input || !list) return;
    input.addEventListener('change', () => {
      list.innerHTML = '';
      Array.from(input.files || []).slice(0,9).forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = e => {
          const card = document.createElement('div');
          card.className = 'image-card';
          card.innerHTML = `<img src="${e.target.result}" alt="Reference ${idx+1}"><input type="text" value="Concept Image [${idx+1}]" />`;
          list.appendChild(card);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function setLang(lang){
    const dict = i18n[lang] || i18n.zh;
    $$('[data-i18n]').forEach(el => { const key = el.getAttribute('data-i18n'); if(dict[key]) el.textContent = dict[key]; });
    localStorage.setItem('studioPosterLang', lang);
  }

  function resetExample(){
    localStorage.removeItem('studioPosterDraft');
    location.reload();
  }

  function autosave(){ localStorage.setItem('studioPosterDraft', JSON.stringify(collectState())); }

  function init(){
    updateSliderLabels();
    handleImages();
    renderHistory();
    const savedLang = localStorage.getItem('studioPosterLang') || 'zh';
    setLang(savedLang);
    const draft = localStorage.getItem('studioPosterDraft');
    if(draft){ try { applyState(JSON.parse(draft)); } catch(e){} }
    generate();

    $('generateBtn')?.addEventListener('click', generate);
    $('copyFullBtn')?.addEventListener('click', copyFull);
    $('downloadJsonBtn')?.addEventListener('click', () => download('studio-poster-v2-spec.json', $('jsonOutput').textContent, 'application/json'));
    $('downloadTxtBtn')?.addEventListener('click', () => download('studio-poster-v2-prompt.txt', $('fullPromptOutput').textContent));
    $('saveHistoryBtn')?.addEventListener('click', saveHistory);
    $('resetBtn')?.addEventListener('click', resetExample);
    $$('[data-lang]').forEach(btn => btn.addEventListener('click', () => setLang(btn.dataset.lang)));
    fields.forEach(id => $(id)?.addEventListener('input', () => { updateSliderLabels(); autosave(); }));
    $$('.rule,.include').forEach(el => el.addEventListener('change', autosave));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
