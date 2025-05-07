import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface HeaderFooterSettings {
  differentFirstPage: boolean;
  differentOddEven: boolean;
  firstPageContent: string;
  oddPageContent: string;
  evenPageContent: string;
}

export interface DocMetadata {
  title: string;
  lastUpdated: Date;
  author: string;
  theme: string;
  headerContent: string;
  footerContent: string;
  headerVisible: boolean;
  footerVisible: boolean;
  headerSettings: HeaderFooterSettings;
  footerSettings: HeaderFooterSettings;
}

const initialHeaderFooterSettings: HeaderFooterSettings = {
  differentFirstPage: false,
  differentOddEven: false,
  firstPageContent: "",
  oddPageContent: "",
  evenPageContent: "",
};

const initialMetadata: DocMetadata = {
  title: "The Docs Title",
  lastUpdated: new Date(),
  author: "Faisal Alqarni",
  theme: "#ffffff",
  headerContent: "",
  footerContent: "",
  headerVisible: true,
  footerVisible: true,
  headerSettings: initialHeaderFooterSettings,
  footerSettings: initialHeaderFooterSettings,
};

const DOC_METADATA_KEY = "doc_metadata";

const getStoredMetadata = (): DocMetadata => {
  try {
    const stored = localStorage.getItem(DOC_METADATA_KEY);
    if (!stored) return initialMetadata;

    const parsed = JSON.parse(stored);

    // Ensure all required properties exist
    return {
      ...initialMetadata,
      ...parsed,
    };
  } catch (error) {
    console.error("Error loading metadata:", error);
    return initialMetadata;
  }
};

const setStoredMetadata = (metadata: DocMetadata) => {
  try {
    localStorage.setItem(DOC_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error("Error saving metadata:", error);
  }
};

export function useDocStore() {
  const queryClient = useQueryClient();

  const { data: metadata = initialMetadata } = useQuery({
    queryKey: ["docMetadata"],
    queryFn: getStoredMetadata,
  });

  const updateMetadataMutation = useMutation({
    mutationFn: async (newMetadata: Partial<DocMetadata>) => {
      const current = getStoredMetadata();
      const updated = {
        ...current,
        ...newMetadata,
      };
      setStoredMetadata(updated);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docMetadata"] });
    },
  });

  return {
    metadata,
    setTitle: (title: string) => updateMetadataMutation.mutate({ title }),
    setLastUpdated: (date: Date) =>
      updateMetadataMutation.mutate({ lastUpdated: date }),
    setAuthor: (author: string) => updateMetadataMutation.mutate({ author }),
    setTheme: (theme: string) => updateMetadataMutation.mutate({ theme }),
    setHeaderContent: (content: string) =>
      updateMetadataMutation.mutate({ headerContent: content }),
    setFooterContent: (content: string) =>
      updateMetadataMutation.mutate({ footerContent: content }),
    setHeaderVisible: (visible: boolean) =>
      updateMetadataMutation.mutate({ headerVisible: visible }),
    setFooterVisible: (visible: boolean) =>
      updateMetadataMutation.mutate({ footerVisible: visible }),
    setHeaderSettings: (settings: HeaderFooterSettings) =>
      updateMetadataMutation.mutate({ headerSettings: settings }),
    setFooterSettings: (settings: HeaderFooterSettings) =>
      updateMetadataMutation.mutate({ footerSettings: settings }),
  };
}
