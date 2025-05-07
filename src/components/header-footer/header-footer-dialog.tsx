import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { HeaderFooterEditor } from "./header-footer-editor";
import { useDocStore } from "@/hooks/use-doc-store";

interface HeaderFooterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HeaderFooterDialog = ({
  open,
  onOpenChange,
}: HeaderFooterDialogProps) => {
  const {
    metadata,
    setHeaderContent,
    setFooterContent,
    setHeaderVisible,
    setFooterVisible,
    setHeaderSettings,
    setFooterSettings,
  } = useDocStore();

  const handleHeaderSettingsChange = (
    settings: Partial<typeof metadata.headerSettings>
  ) => {
    setHeaderSettings({ ...metadata.headerSettings, ...settings });
  };

  const handleFooterSettingsChange = (
    settings: Partial<typeof metadata.footerSettings>
  ) => {
    setFooterSettings({ ...metadata.footerSettings, ...settings });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Header and Footer</DialogTitle>
        </DialogHeader>

        <Tabs.Root defaultValue="header" className="mt-4">
          <Tabs.List className="flex border-b mb-4">
            <Tabs.Trigger
              value="header"
              className="px-4 py-2 -mb-px text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              Header
            </Tabs.Trigger>
            <Tabs.Trigger
              value="footer"
              className="px-4 py-2 -mb-px text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              Footer
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="header" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={metadata.headerVisible}
                    onCheckedChange={(checked) => setHeaderVisible(checked)}
                  />
                  <label className="text-sm font-medium">Show header</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={metadata.headerSettings.differentFirstPage}
                    onCheckedChange={(checked) =>
                      handleHeaderSettingsChange({
                        differentFirstPage: checked,
                      })
                    }
                  />
                  <label className="text-sm font-medium">
                    Different first page
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={metadata.headerSettings.differentOddEven}
                    onCheckedChange={(checked) =>
                      handleHeaderSettingsChange({ differentOddEven: checked })
                    }
                  />
                  <label className="text-sm font-medium">
                    Different odd and even pages
                  </label>
                </div>
              </div>
            </div>

            {metadata.headerVisible && (
              <div className="space-y-4">
                {metadata.headerSettings.differentFirstPage && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      First Page Header
                    </h3>
                    <HeaderFooterEditor
                      content={metadata.headerSettings.firstPageContent}
                      onChange={(content) =>
                        handleHeaderSettingsChange({
                          firstPageContent: content,
                        })
                      }
                      type="header"
                    />
                  </div>
                )}
                {metadata.headerSettings.differentOddEven ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Odd Pages Header
                      </h3>
                      <HeaderFooterEditor
                        content={metadata.headerSettings.oddPageContent}
                        onChange={(content) =>
                          handleHeaderSettingsChange({
                            oddPageContent: content,
                          })
                        }
                        type="header"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Even Pages Header
                      </h3>
                      <HeaderFooterEditor
                        content={metadata.headerSettings.evenPageContent}
                        onChange={(content) =>
                          handleHeaderSettingsChange({
                            evenPageContent: content,
                          })
                        }
                        type="header"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Header Content</h3>
                    <HeaderFooterEditor
                      content={metadata.headerContent}
                      onChange={setHeaderContent}
                      type="header"
                    />
                  </div>
                )}
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="footer" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={metadata.footerVisible}
                    onCheckedChange={(checked) => setFooterVisible(checked)}
                  />
                  <label className="text-sm font-medium">Show footer</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={metadata.footerSettings.differentFirstPage}
                    onCheckedChange={(checked) =>
                      handleFooterSettingsChange({
                        differentFirstPage: checked,
                      })
                    }
                  />
                  <label className="text-sm font-medium">
                    Different first page
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={metadata.footerSettings.differentOddEven}
                    onCheckedChange={(checked) =>
                      handleFooterSettingsChange({ differentOddEven: checked })
                    }
                  />
                  <label className="text-sm font-medium">
                    Different odd and even pages
                  </label>
                </div>
              </div>
            </div>

            {metadata.footerVisible && (
              <div className="space-y-4">
                {metadata.footerSettings.differentFirstPage && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      First Page Footer
                    </h3>
                    <HeaderFooterEditor
                      content={metadata.footerSettings.firstPageContent}
                      onChange={(content) =>
                        handleFooterSettingsChange({
                          firstPageContent: content,
                        })
                      }
                      type="footer"
                    />
                  </div>
                )}
                {metadata.footerSettings.differentOddEven ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Odd Pages Footer
                      </h3>
                      <HeaderFooterEditor
                        content={metadata.footerSettings.oddPageContent}
                        onChange={(content) =>
                          handleFooterSettingsChange({
                            oddPageContent: content,
                          })
                        }
                        type="footer"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Even Pages Footer
                      </h3>
                      <HeaderFooterEditor
                        content={metadata.footerSettings.evenPageContent}
                        onChange={(content) =>
                          handleFooterSettingsChange({
                            evenPageContent: content,
                          })
                        }
                        type="footer"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Footer Content</h3>
                    <HeaderFooterEditor
                      content={metadata.footerContent}
                      onChange={setFooterContent}
                      type="footer"
                    />
                  </div>
                )}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </DialogContent>
    </Dialog>
  );
};
