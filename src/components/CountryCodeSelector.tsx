import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

interface CountryCodeSelectorProps {
  value: string;
  onChange: (dialCode: string) => void;
  className?: string;
}

const POPULAR_COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
];

const ALL_COUNTRIES: Country[] = [
  ...POPULAR_COUNTRIES,
  { code: "AD", name: "Andorra", flag: "🇦🇩", dialCode: "+376" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971" },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", dialCode: "+93" },
  { code: "AG", name: "Antigua and Barbuda", flag: "🇦🇬", dialCode: "+1" },
  { code: "AI", name: "Anguilla", flag: "🇦🇮", dialCode: "+1" },
  { code: "AL", name: "Albania", flag: "🇦🇱", dialCode: "+355" },
  { code: "AM", name: "Armenia", flag: "🇦🇲", dialCode: "+374" },
  { code: "AO", name: "Angola", flag: "🇦🇴", dialCode: "+244" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54" },
  { code: "AS", name: "American Samoa", flag: "🇦🇸", dialCode: "+1" },
  { code: "AT", name: "Austria", flag: "🇦🇹", dialCode: "+43" },
  { code: "AW", name: "Aruba", flag: "🇦🇼", dialCode: "+297" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", dialCode: "+994" },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", dialCode: "+387" },
  { code: "BB", name: "Barbados", flag: "🇧🇧", dialCode: "+1" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dialCode: "+880" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", dialCode: "+32" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dialCode: "+226" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", dialCode: "+359" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", dialCode: "+973" },
  { code: "BI", name: "Burundi", flag: "🇧🇮", dialCode: "+257" },
  { code: "BJ", name: "Benin", flag: "🇧🇯", dialCode: "+229" },
  { code: "BM", name: "Bermuda", flag: "🇧🇲", dialCode: "+1" },
  { code: "BN", name: "Brunei", flag: "🇧🇳", dialCode: "+673" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", dialCode: "+591" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "+55" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", dialCode: "+1" },
  { code: "BT", name: "Bhutan", flag: "🇧🇹", dialCode: "+975" },
  { code: "BW", name: "Botswana", flag: "🇧🇼", dialCode: "+267" },
  { code: "BY", name: "Belarus", flag: "🇧🇾", dialCode: "+375" },
  { code: "BZ", name: "Belize", flag: "🇧🇿", dialCode: "+501" },
  { code: "CD", name: "Democratic Republic of the Congo", flag: "🇨🇩", dialCode: "+243" },
  { code: "CF", name: "Central African Republic", flag: "🇨🇫", dialCode: "+236" },
  { code: "CG", name: "Republic of the Congo", flag: "🇨🇬", dialCode: "+242" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dialCode: "+41" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dialCode: "+225" },
  { code: "CK", name: "Cook Islands", flag: "🇨🇰", dialCode: "+682" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", dialCode: "+237" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "+57" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", dialCode: "+506" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", dialCode: "+53" },
  { code: "CV", name: "Cape Verde", flag: "🇨🇻", dialCode: "+238" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", dialCode: "+357" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", dialCode: "+420" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯", dialCode: "+253" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dialCode: "+45" },
  { code: "DM", name: "Dominica", flag: "🇩🇲", dialCode: "+1" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", dialCode: "+1" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", dialCode: "+213" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "+593" },
  { code: "EE", name: "Estonia", flag: "🇪🇪", dialCode: "+372" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dialCode: "+20" },
  { code: "ER", name: "Eritrea", flag: "🇪🇷", dialCode: "+291" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "+34" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", dialCode: "+251" },
  { code: "FI", name: "Finland", flag: "🇫🇮", dialCode: "+358" },
  { code: "FJ", name: "Fiji", flag: "🇫🇯", dialCode: "+679" },
  { code: "FK", name: "Falkland Islands", flag: "🇫🇰", dialCode: "+500" },
  { code: "FM", name: "Micronesia", flag: "🇫🇲", dialCode: "+691" },
  { code: "FO", name: "Faroe Islands", flag: "🇫🇴", dialCode: "+298" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", dialCode: "+241" },
  { code: "GD", name: "Grenada", flag: "🇬🇩", dialCode: "+1" },
  { code: "GE", name: "Georgia", flag: "🇬🇪", dialCode: "+995" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233" },
  { code: "GI", name: "Gibraltar", flag: "🇬🇮", dialCode: "+350" },
  { code: "GL", name: "Greenland", flag: "🇬🇱", dialCode: "+299" },
  { code: "GM", name: "Gambia", flag: "🇬🇲", dialCode: "+220" },
  { code: "GN", name: "Guinea", flag: "🇬🇳", dialCode: "+224" },
  { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶", dialCode: "+240" },
  { code: "GR", name: "Greece", flag: "🇬🇷", dialCode: "+30" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", dialCode: "+502" },
  { code: "GU", name: "Guam", flag: "🇬🇺", dialCode: "+1" },
  { code: "GW", name: "Guinea-Bissau", flag: "🇬🇼", dialCode: "+245" },
  { code: "GY", name: "Guyana", flag: "🇬🇾", dialCode: "+592" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", dialCode: "+852" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", dialCode: "+504" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", dialCode: "+385" },
  { code: "HT", name: "Haiti", flag: "🇭🇹", dialCode: "+509" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", dialCode: "+36" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dialCode: "+62" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dialCode: "+353" },
  { code: "IL", name: "Israel", flag: "🇮🇱", dialCode: "+972" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", dialCode: "+964" },
  { code: "IR", name: "Iran", flag: "🇮🇷", dialCode: "+98" },
  { code: "IS", name: "Iceland", flag: "🇮🇸", dialCode: "+354" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dialCode: "+39" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", dialCode: "+1" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", dialCode: "+962" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254" },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬", dialCode: "+996" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭", dialCode: "+855" },
  { code: "KI", name: "Kiribati", flag: "🇰🇮", dialCode: "+686" },
  { code: "KM", name: "Comoros", flag: "🇰🇲", dialCode: "+269" },
  { code: "KN", name: "Saint Kitts and Nevis", flag: "🇰🇳", dialCode: "+1" },
  { code: "KP", name: "North Korea", flag: "🇰🇵", dialCode: "+850" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dialCode: "+82" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dialCode: "+965" },
  { code: "KY", name: "Cayman Islands", flag: "🇰🇾", dialCode: "+1" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", dialCode: "+7" },
  { code: "LA", name: "Laos", flag: "🇱🇦", dialCode: "+856" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", dialCode: "+961" },
  { code: "LC", name: "Saint Lucia", flag: "🇱🇨", dialCode: "+1" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮", dialCode: "+423" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dialCode: "+94" },
  { code: "LR", name: "Liberia", flag: "🇱🇷", dialCode: "+231" },
  { code: "LS", name: "Lesotho", flag: "🇱🇸", dialCode: "+266" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", dialCode: "+370" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", dialCode: "+352" },
  { code: "LV", name: "Latvia", flag: "🇱🇻", dialCode: "+371" },
  { code: "LY", name: "Libya", flag: "🇱🇾", dialCode: "+218" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", dialCode: "+212" },
  { code: "MC", name: "Monaco", flag: "🇲🇨", dialCode: "+377" },
  { code: "MD", name: "Moldova", flag: "🇲🇩", dialCode: "+373" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", dialCode: "+382" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", dialCode: "+261" },
  { code: "MH", name: "Marshall Islands", flag: "🇲🇭", dialCode: "+692" },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰", dialCode: "+389" },
  { code: "ML", name: "Mali", flag: "🇲🇱", dialCode: "+223" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", dialCode: "+95" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", dialCode: "+976" },
  { code: "MO", name: "Macau", flag: "🇲🇴", dialCode: "+853" },
  { code: "MP", name: "Northern Mariana Islands", flag: "🇲🇵", dialCode: "+1" },
  { code: "MR", name: "Mauritania", flag: "🇲🇷", dialCode: "+222" },
  { code: "MS", name: "Montserrat", flag: "🇲🇸", dialCode: "+1" },
  { code: "MT", name: "Malta", flag: "🇲🇹", dialCode: "+356" },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", dialCode: "+230" },
  { code: "MV", name: "Maldives", flag: "🇲🇻", dialCode: "+960" },
  { code: "MW", name: "Malawi", flag: "🇲🇼", dialCode: "+265" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dialCode: "+52" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", dialCode: "+258" },
  { code: "NA", name: "Namibia", flag: "🇳🇦", dialCode: "+264" },
  { code: "NC", name: "New Caledonia", flag: "🇳🇨", dialCode: "+687" },
  { code: "NE", name: "Niger", flag: "🇳🇪", dialCode: "+227" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", dialCode: "+505" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dialCode: "+31" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dialCode: "+47" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", dialCode: "+977" },
  { code: "NR", name: "Nauru", flag: "🇳🇷", dialCode: "+674" },
  { code: "NU", name: "Niue", flag: "🇳🇺", dialCode: "+683" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dialCode: "+64" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dialCode: "+968" },
  { code: "PA", name: "Panama", flag: "🇵🇦", dialCode: "+507" },
  { code: "PE", name: "Peru", flag: "🇵🇪", dialCode: "+51" },
  { code: "PF", name: "French Polynesia", flag: "🇵🇫", dialCode: "+689" },
  { code: "PG", name: "Papua New Guinea", flag: "🇵🇬", dialCode: "+675" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dialCode: "+63" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92" },
  { code: "PL", name: "Poland", flag: "🇵🇱", dialCode: "+48" },
  { code: "PM", name: "Saint Pierre and Miquelon", flag: "🇵🇲", dialCode: "+508" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", dialCode: "+1" },
  { code: "PS", name: "Palestine", flag: "🇵🇸", dialCode: "+970" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351" },
  { code: "PW", name: "Palau", flag: "🇵🇼", dialCode: "+680" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", dialCode: "+595" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dialCode: "+974" },
  { code: "RO", name: "Romania", flag: "🇷🇴", dialCode: "+40" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", dialCode: "+381" },
  { code: "RU", name: "Russia", flag: "🇷🇺", dialCode: "+7" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", dialCode: "+250" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966" },
  { code: "SB", name: "Solomon Islands", flag: "🇸🇧", dialCode: "+677" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", dialCode: "+248" },
  { code: "SD", name: "Sudan", flag: "🇸🇩", dialCode: "+249" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dialCode: "+46" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65" },
  { code: "SH", name: "Saint Helena", flag: "🇸🇭", dialCode: "+290" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", dialCode: "+386" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", dialCode: "+421" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱", dialCode: "+232" },
  { code: "SM", name: "San Marino", flag: "🇸🇲", dialCode: "+378" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", dialCode: "+221" },
  { code: "SO", name: "Somalia", flag: "🇸🇴", dialCode: "+252" },
  { code: "SR", name: "Suriname", flag: "🇸🇷", dialCode: "+597" },
  { code: "ST", name: "São Tomé and Príncipe", flag: "🇸🇹", dialCode: "+239" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", dialCode: "+503" },
  { code: "SY", name: "Syria", flag: "🇸🇾", dialCode: "+963" },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿", dialCode: "+268" },
  { code: "TC", name: "Turks and Caicos Islands", flag: "🇹🇨", dialCode: "+1" },
  { code: "TD", name: "Chad", flag: "🇹🇩", dialCode: "+235" },
  { code: "TG", name: "Togo", flag: "🇹🇬", dialCode: "+228" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dialCode: "+66" },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯", dialCode: "+992" },
  { code: "TK", name: "Tokelau", flag: "🇹🇰", dialCode: "+690" },
  { code: "TL", name: "Timor-Leste", flag: "🇹🇱", dialCode: "+670" },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲", dialCode: "+993" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", dialCode: "+216" },
  { code: "TO", name: "Tonga", flag: "🇹🇴", dialCode: "+676" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", dialCode: "+90" },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹", dialCode: "+1" },
  { code: "TV", name: "Tuvalu", flag: "🇹🇻", dialCode: "+688" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", dialCode: "+886" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", dialCode: "+255" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", dialCode: "+380" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", dialCode: "+256" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dialCode: "+598" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", dialCode: "+998" },
  { code: "VA", name: "Vatican City", flag: "🇻🇦", dialCode: "+39" },
  { code: "VC", name: "Saint Vincent and the Grenadines", flag: "🇻🇨", dialCode: "+1" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dialCode: "+58" },
  { code: "VG", name: "British Virgin Islands", flag: "🇻🇬", dialCode: "+1" },
  { code: "VI", name: "U.S. Virgin Islands", flag: "🇻🇮", dialCode: "+1" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dialCode: "+84" },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺", dialCode: "+678" },
  { code: "WF", name: "Wallis and Futuna", flag: "🇼🇫", dialCode: "+681" },
  { code: "WS", name: "Samoa", flag: "🇼🇸", dialCode: "+685" },
  { code: "YE", name: "Yemen", flag: "🇾🇪", dialCode: "+967" },
  { code: "YT", name: "Mayotte", flag: "🇾🇹", dialCode: "+262" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", dialCode: "+260" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", dialCode: "+263" },
];

// Remove duplicates based on dial code and prioritize popular countries
const UNIQUE_COUNTRIES = ALL_COUNTRIES.reduce((acc: Country[], country) => {
  const exists = acc.find(c => c.dialCode === country.dialCode && c.name === country.name);
  if (!exists) {
    acc.push(country);
  }
  return acc;
}, []);

export default function CountryCodeSelector({ value, onChange, className }: CountryCodeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedCountry = UNIQUE_COUNTRIES.find(country => country.dialCode === value) || POPULAR_COUNTRIES[0];

  const filteredCountries = UNIQUE_COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    country.dialCode.includes(searchValue) ||
    country.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  const popularFiltered = POPULAR_COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    country.dialCode.includes(searchValue) ||
    country.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  const otherFiltered = filteredCountries.filter(country => 
    !POPULAR_COUNTRIES.some(popular => popular.dialCode === country.dialCode && popular.name === country.name)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between px-3 h-10 bg-muted/50 border-input transition-all duration-200 hover:bg-muted/70",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-card border-white/10" align="start">
        <Command>
          <CommandInput 
            placeholder="Search countries..." 
            value={searchValue}
            onValueChange={setSearchValue}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-64">
            <CommandEmpty>No country found.</CommandEmpty>
            
            {popularFiltered.length > 0 && searchValue === "" && (
              <CommandGroup heading="Popular">
                {popularFiltered.map((country) => (
                  <CommandItem
                    key={`popular-${country.code}-${country.dialCode}`}
                    value={`${country.name} ${country.dialCode} ${country.code}`}
                    onSelect={() => {
                      onChange(country.dialCode);
                      setOpen(false);
                    }}
                    className="cursor-pointer transition-colors duration-200 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-base">{country.flag}</span>
                      <span className="text-sm font-medium min-w-[3rem]">{country.dialCode}</span>
                      <span className="text-sm flex-1 truncate">{country.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCountry.dialCode === country.dialCode ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {otherFiltered.length > 0 && (
              <CommandGroup heading={searchValue === "" ? "All Countries" : "Results"}>
                {otherFiltered.map((country) => (
                  <CommandItem
                    key={`other-${country.code}-${country.dialCode}`}
                    value={`${country.name} ${country.dialCode} ${country.code}`}
                    onSelect={() => {
                      onChange(country.dialCode);
                      setOpen(false);
                    }}
                    className="cursor-pointer transition-colors duration-200 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-base">{country.flag}</span>
                      <span className="text-sm font-medium min-w-[3rem]">{country.dialCode}</span>
                      <span className="text-sm flex-1 truncate">{country.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCountry.dialCode === country.dialCode ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}