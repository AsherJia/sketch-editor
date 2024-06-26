import Node from '../node/Node';
import Root from '../node/Root';
import Listener from './Listener';
import BasicPanel from './BasicPanel';
import OpacityPanel from './OpacityPanel';
import RoundPanel from './RoundPanel';
import FillPanel from './FillPanel';
import StrokePanel from './StrokePanel';
import TextPanel from './TextPanel';

class Panel {
  root: Root;
  dom: HTMLElement;
  listener: Listener;
  basicPanel: BasicPanel;
  opacityPanel: OpacityPanel;
  roundPanel: RoundPanel;
  fillPanel: FillPanel;
  strokePanel: StrokePanel;
  textPanel: TextPanel;

  constructor(root: Root, dom: HTMLElement, listener: Listener) {
    this.root = root;
    this.dom = dom;
    this.listener = listener;

    this.basicPanel = new BasicPanel(root, dom, listener);
    this.basicPanel.show(listener.selected);

    this.opacityPanel = new OpacityPanel(root, dom, listener);
    this.opacityPanel.show(listener.selected);

    this.roundPanel = new RoundPanel(root, dom, listener);
    this.roundPanel.show(listener.selected);

    this.fillPanel = new FillPanel(root, dom, listener);
    this.fillPanel.show(listener.selected);

    this.strokePanel = new StrokePanel(root, dom, listener);
    this.strokePanel.show(listener.selected);

    this.textPanel = new TextPanel(root, dom, listener);
    this.textPanel.show(listener.selected);
  }
}

export default Panel;
