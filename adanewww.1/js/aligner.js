// Smith-Waterman alignment engine using graphic-smith-waterman (MIT)
// Minimal in-browser implementation
// Source: https://github.com/robertzk/graphic-smith-waterman (MIT)
// (Simplified for this game)

function SWaligner({ similarityScoreFunction, gapScoreFunction }) {
  return {
    align: function(seq1, seq2) {
      const m = seq1.length, n = seq2.length;
      const score = Array(m+1).fill().map(() => Array(n+1).fill(0));
      let maxScore = 0, maxPos = [0,0];
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const match = score[i-1][j-1] + similarityScoreFunction(seq1[i-1], seq2[j-1]);
          const del = score[i-1][j] + gapScoreFunction(1);
          const ins = score[i][j-1] + gapScoreFunction(1);
          score[i][j] = Math.max(0, match, del, ins);
          if (score[i][j] > maxScore) {
            maxScore = score[i][j];
            maxPos = [i, j];
          }
        }
      }
      // Traceback
      let align1 = '', align2 = '';
      let i = maxPos[0], j = maxPos[1];
      while (i > 0 && j > 0 && score[i][j] > 0) {
        if (score[i][j] === score[i-1][j-1] + similarityScoreFunction(seq1[i-1], seq2[j-1])) {
          align1 = seq1[i-1] + align1;
          align2 = seq2[j-1] + align2;
          i--; j--;
        } else if (score[i][j] === score[i-1][j] + gapScoreFunction(1)) {
          align1 = seq1[i-1] + align1;
          align2 = '-' + align2;
          i--;
        } else {
          align1 = '-' + align1;
          align2 = seq2[j-1] + align2;
          j--;
        }
      }
      return {
        score: maxScore,
        align1,
        align2
      };
    }
  };
}
