// Game logic and DOM updates
// Handles both index.html and results.html

// Helper: Save sample to localStorage
function saveSample(seq) {
  localStorage.setItem('sampleSeq', seq);
}
// Helper: Load sample from localStorage
function loadSample() {
  return localStorage.getItem('sampleSeq') || '';
}

// On index.html: handle form
if (document.getElementById('dna-form')) {
  document.getElementById('dna-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const seq = document.getElementById('sample-seq').value.trim().toUpperCase();
    if (!seq.match(/^[ACGT]+$/)) {
      document.getElementById('form-warning').textContent = 'Please enter a valid DNA sequence (A, C, G, T only).';
      return;
    }
    saveSample(seq);
    window.location.href = 'results.html';
  });
}

// On results.html: run alignment and show results
if (window.location.pathname.endsWith('results.html')) {
  const sampleSeq = loadSample();
  if (!sampleSeq) {
    document.getElementById('results').textContent = 'No DNA sample found. Please return to the crime scene.';
  } else {
    const aligner = SWaligner({
      similarityScoreFunction: (a, b) => a === b ? 2 : -1,
      gapScoreFunction: k => -k
    });
    let best = null, second = null;
    database.forEach(person => {
      const res = aligner.align(sampleSeq, person.dnaSequence);
      if (!best || res.score > best.res.score) {
        second = best;
        best = { person, res };
      } else if (!second || res.score > second.res.score) {
        second = { person, res };
      }
    });
    // Render best match
    let html = `<h2>Best Match: ${best.person.name}</h2>`;
    html += `<div class="profile"><b>Occupation:</b> ${best.person.profile.occupation}<br><b>Alibi:</b> ${best.person.profile.alibi}<br><b>Notes:</b> ${best.person.profile.notes}</div>`;
    html += `<div class="alignment"><pre>${best.res.align1}\n${best.res.align2}</pre></div>`;
    html += `<div class="score">Alignment Score: <b>${best.res.score}</b></div>`;
    if (second) {
      html += `<details><summary>Show 2nd Best Match</summary><h3>${second.person.name}</h3><div class="profile"><b>Occupation:</b> ${second.person.profile.occupation}<br><b>Alibi:</b> ${second.person.profile.alibi}<br><b>Notes:</b> ${second.person.profile.notes}</div><div class="alignment"><pre>${second.res.align1}\n${second.res.align2}</pre></div><div class="score">Alignment Score: <b>${second.res.score}</b></div></details>`;
    }
    // Threshold warning
    if (best.res.score < 10) {
      html += `<div class="warning">⚠️ Not a confident match—risk of false arrest.</div>`;
    }
    document.getElementById('results').innerHTML = html;
    // Actions
    document.getElementById('actions').innerHTML = `<button onclick="alert('You arrested ${best.person.name}!')">Arrest</button><button onclick="alert('Keep investigating!')">Investigate More</button>`;
  }
}
