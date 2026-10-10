import { render, screen, fireEvent } from '@testing-library/react';
import Converter from './Converter';

const rates = { CNY: 1, USD: 0.14, JPY: 21 };
const names = { CNY: '人民币', USD: '美元', JPY: '日元' };

test('converts between two foreign currencies via CNY', () => {
  const { container } = render(<Converter rates={rates} names={names} />);
  // 默认 100 USD → CNY
  expect(container.querySelector('output')).toHaveTextContent('714.2857');

  const [, toSelect] = screen.getAllByRole('combobox');
  fireEvent.change(toSelect, { target: { value: 'JPY' } });
  expect(container.querySelector('output')).toHaveTextContent('15,000.00');

  fireEvent.click(screen.getByLabelText('交换币种'));
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '15000' } });
  expect(container.querySelector('output')).toHaveTextContent('100.00');
});
