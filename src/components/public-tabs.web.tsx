import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';

import { CustomTabList, TabButton } from './web-tab-list';

export default function PublicTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}
