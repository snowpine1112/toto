interface ScoreMatrixProps {
  matrix: number[][];
  predictedHome: number;
  predictedAway: number;
}

export function ScoreMatrix({ matrix, predictedHome, predictedAway }: ScoreMatrixProps) {
  const maxGoals = matrix.length - 1;

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse w-full">
        <thead>
          <tr>
            <th className="p-1 text-gray-500 font-normal">H\A</th>
            {Array.from({ length: maxGoals + 1 }, (_, i) => (
              <th key={i} className="p-1 text-center text-gray-500 font-normal w-10">
                {i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, h) => (
            <tr key={h}>
              <td className="p-1 text-gray-500 font-normal text-center">{h}</td>
              {row.map((prob, a) => {
                const pct = Math.round(prob * 100);
                const isBest = h === predictedHome && a === predictedAway;
                return (
                  <td
                    key={a}
                    className={`p-1 text-center rounded ${
                      isBest
                        ? 'bg-blue-500 text-white font-bold'
                        : pct >= 8
                        ? 'bg-blue-100 text-blue-800'
                        : pct >= 4
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {pct > 0 ? `${pct}%` : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
