import Layout from '@/Layouts/BasicLayout';
import Home from '@/pages/Home';
import NotFound from '@/components/NotFound';
import Console from '@/pages/Console';
import Work from '@/pages/Work';
import Find from '@/pages/Find';
import Split from '@/pages/Split';
import Sort from '@/pages/Sort';
import History from '@/pages/History';
import Edit from '@/pages/Edit';
import View from '@/pages/View';
import Files from '@/pages/Files';

const routerConfig = [
  {
    path: '/',
    component: Layout,
    children: [
    {
      path: '/',
      exact: true,
      component: Home,
    },
    {
      path: '/console',
      component: Console,
    },
    {
      path: '/calc',
      component: Work,
    },
    {
      path: '/edit',
      component: Edit,
    },
    {
      path: '/view',
      component: View,
    },
    {
      path: '/find',
      component: Find,
    },
    {
      path: '/split',
      component: Split,
    },
    {
      path: '/sort',
      component: Sort,
    },
    {
      path: '/history',
      component: History,
    },
    {
      path: '/files',
      component: Files,
    },
    {
      component: NotFound,
    }]
  },
];

export default routerConfig;
