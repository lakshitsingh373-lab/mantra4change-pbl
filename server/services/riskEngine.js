function classifyRisk(rate) {
  if (rate >= 0.75) return 'On Track';
  if (rate >= 0.60) return 'Behind';
  if (rate >= 0.35) return 'At Risk';
  return 'Critical';
}

function getRiskColor(status) {
  const colors = {
    'On Track': 'green',
    'Behind': 'yellow',
    'At Risk': 'orange',
    'Critical': 'red'
  };
  return colors[status] || 'gray';
}

function calcRate(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  return numerator / denominator;
}

module.exports = { classifyRisk, getRiskColor, calcRate };