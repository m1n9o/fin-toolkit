import { lazy } from 'react';

// 工具注册表：新增工具只需在 src/tools/ 下新建目录，并在这里加一项。
// 首页卡片、顶部导航和路由都由此列表自动生成；icon 为 components/Icon 中的图标名。
const tools = [
  {
    path: 'prepayment-calculator',
    name: '提前还款计算器',
    icon: 'calculator',
    description: '计算提前还款的节省利息和剩余期数',
    component: lazy(() => import('./prepayment-calculator')),
  },
  {
    path: 'exchange-rate',
    name: '实时汇率数据',
    icon: 'exchange',
    description: '查看人民币与外币汇率',
    component: lazy(() => import('./exchange-rate')),
  },
];

export default tools;
