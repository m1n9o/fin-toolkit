import React, { useEffect, useState } from 'react';
import AmountSliders, { STEP } from './AmountSliders';
import { MODE_NAMES, buildExportData, buildMarkdown, downloadFile } from './export';
import Methodology from './Methodology';

const money = (n) =>
  `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

const money0 = (n) => `¥${Math.round(n).toLocaleString('zh-CN')}`;

const signed = (n) => `${n >= 0 ? '+' : '−'}${money0(Math.abs(n))}`;

const formatPeriods = (months) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (!years) return `${rest} 个月`;
  return rest ? `${years} 年 ${rest} 个月` : `${years} 年`;
};

const MODES = [
  { value: 'shorten', label: '缩短年限', note: '月供不变，省息最多' },
  { value: 'reduce', label: '减少月供', note: '年限不变，现金流更宽松' },
];

const ModeSwitch = ({ mode, onChange }) => (
  <div className="mode-switch" role="radiogroup" aria-label="还款方式">
    {MODES.map((m) => (
      <button
        key={m.value}
        type="button"
        role="radio"
        aria-checked={mode === m.value}
        className={`mode-option ${mode === m.value ? 'is-active' : ''}`}
        onClick={() => onChange(m.value)}
      >
        <span className="mode-label">{m.label}</span>
        <span className="mode-note">{m.note}</span>
      </button>
    ))}
  </div>
);

const Stat = ({ label, value, meta, tone }) => (
  <div className={`stat card ${tone ? `is-${tone}` : ''}`}>
    <span className="stat-label">{label}</span>
    <span className="stat-value num">{value}</span>
    {meta && <span className="stat-meta">{meta}</span>}
  </div>
);

const ExportPanel = ({ params, analyses }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const stamp = new Date().toISOString().slice(0, 10);

  const copy = async () => {
    const text = buildMarkdown(params, analyses);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      downloadFile(`提前还款分析-${stamp}.md`, text, 'text/markdown;charset=utf-8');
    }
  };

  return (
    <div className="export card">
      <div>
        <h2 className="panel-title">导出数据</h2>
        <p className="export-note">包含两种还款方式的完整对比、你的输入和计算假设，可直接发给理财 AI 分析</p>
      </div>
      <div className="export-actions">
        <button type="button" className="btn btn-primary" onClick={copy}>
          {copied ? '已复制 ✓' : '复制给 AI'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => downloadFile(`提前还款分析-${stamp}.md`, buildMarkdown(params, analyses), 'text/markdown;charset=utf-8')}
        >
          下载 Markdown
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            downloadFile(
              `提前还款分析-${stamp}.json`,
              JSON.stringify(buildExportData(params, analyses), null, 2),
              'application/json;charset=utf-8'
            )
          }
        >
          下载 JSON
        </button>
      </div>
    </div>
  );
};

const Results = ({ params, analyses, mode, onModeChange, onAmountsChange }) => {
  if (!params) {
    return (
      <div className="empty card">
        <div className="empty-art" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        <h3>填写左侧贷款信息</h3>
        <p>计算后可通过滑轨自选最多 5 个提前还款金额，并综合理财、个税、公积金进行对比</p>
      </div>
    );
  }

  if (params.principal <= STEP) {
    return (
      <div className="empty card">
        <h3>暂无可对比的方案</h3>
        <p>贷款本金需大于 1 万元</p>
      </div>
    );
  }

  const analysis = analyses[mode];
  if (analysis.error) {
    return (
      <div className="empty card">
        <h3>月供不足以覆盖利息</h3>
        <p>请检查本金、月供和利率是否填写正确</p>
      </div>
    );
  }

  const { base, reference, results, hpf } = analysis;
  const showTax = params.taxRate > 0;
  const top = results[results.length - 1];
  const taxWarning = showTax && results.some((r) => r.taxLoss > 0);

  return (
    <>
      <AmountSliders amounts={params.amounts} principal={params.principal} onChange={onAmountsChange} />

      <ModeSwitch mode={mode} onChange={onModeChange} />

      <div className="stats">
        <Stat
          label="当前剩余"
          value={`${base.months} 期`}
          meta={`约 ${formatPeriods(base.months)} · 剩余利息 ${money0(base.interest)}`}
        />
        {top && (
          <Stat
            label="最多节省利息"
            value={money0(top.savedInterest)}
            meta={`提前还款 ${money0(top.prepayment)}`}
            tone="accent"
          />
        )}
        {top && (
          <Stat
            label={`对比 ${params.investRate}% 理财`}
            value={signed(top.vsInvest)}
            meta={
              top.vsInvest >= 0
                ? `提前还款更划算；理财收益需高于 ${top.breakevenRate.toFixed(2)}% 才值得`
                : `理财更划算；收益低于 ${top.breakevenRate.toFixed(2)}% 时才建议提前还`
            }
            tone={top.vsInvest >= 0 ? 'accent' : 'warn'}
          />
        )}
      </div>

      {hpf && (
        <div className="hpf card">
          <div className="hpf-head">
            <span className="eyebrow">公积金冲还贷</span>
            <p className="hpf-note">余额一次性提前还款 + 每月缴存冲抵月供（不含额外提前还款）</p>
          </div>
          <dl className="hpf-grid">
            <div>
              <dt>利息少付</dt>
              <dd className="num">{money0(hpf.savedInterest)}</dd>
            </div>
            <div>
              <dt>{mode === 'shorten' ? '提前还清' : '还款期数'}</dt>
              <dd className="num">{mode === 'shorten' ? formatPeriods(hpf.monthsSaved) : `${reference.months} 期`}</dd>
            </div>
            <div>
              <dt>每月少掏现金</dt>
              <dd className="num">{money0(hpf.monthlyCashRelief + (mode === 'reduce' ? params.monthlyPayment - reference.payment : 0))}</dd>
            </div>
            <div>
              <dt>相比留在账户，期末多得</dt>
              <dd className="num">{signed(hpf.wealthGain)}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>提前还款</th>
              <th>{mode === 'shorten' ? '剩余期数' : '新月供'}</th>
              <th className="align-right">节省利息</th>
              {showTax && <th className="align-right">个税损失</th>}
              <th className="align-right">对比理财</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.prepayment}>
                <td className="num strong">{money(r.prepayment)}</td>
                <td className="num">
                  {mode === 'shorten' ? (
                    <>
                      {r.cleared ? '一次结清' : `${r.months} 月`}
                      <span className="sub">缩短 {formatPeriods(r.monthsSaved)}</span>
                    </>
                  ) : (
                    <>
                      {money0(r.payment)}
                      <span className="sub">每月少 {money0(reference.payment - r.payment)}</span>
                    </>
                  )}
                </td>
                <td className="align-right">
                  <span className="num saved">{money0(r.savedInterest)}</span>
                  <span className="bar">
                    <span style={{ width: `${Math.max(0, Math.min(100, (r.savedInterest / base.interest) * 100))}%` }} />
                  </span>
                </td>
                {showTax && (
                  <td className={`num align-right ${r.taxLoss > 0 ? 'warn' : 'muted'}`}>
                    {r.taxLoss > 0 ? `−${money0(r.taxLoss)}` : '无'}
                  </td>
                )}
                <td className="align-right">
                  <span className={`num ${r.vsInvest >= 0 ? 'saved' : 'warn'}`}>{signed(r.vsInvest)}</span>
                  <span className="sub">平衡点 {r.breakevenRate.toFixed(2)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {taxWarning && (
        <p className="tax-warning">
          {MODE_NAMES.shorten}会让房贷利息个税扣除提前结束。切换到「减少月供」，或保留少量尾款按原期限还，可保住扣除。
        </p>
      )}

      <Methodology />

      <ExportPanel params={params} analyses={analyses} />
    </>
  );
};

export default Results;
