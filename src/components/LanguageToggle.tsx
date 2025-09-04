import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "pt" : "en");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2 hover:bg-accent/20 transition-all duration-200"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {language === "en" ? "EN" : "PT"}
      </span>
    </Button>
  );
};

export default LanguageToggle;
