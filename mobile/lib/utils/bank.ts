import { Bank } from "@/types/paystack/paystack";

const BANK_LOGO_DOMAINS: Record<string, string> = {
	"044": "accessbankplc.com",
	"063": "accessbankplc.com",
	"023": "citibank.com",
	"050": "ecobank.com",
	"070": "fidelitybank.ng",
	"011": "firstbanknigeria.com",
	"214": "fcmb.com",
	"00103": "globusbank.com",
	"058": "gtbank.com",
	"030": "hbng.com",
	"082": "keystonebankng.com",
	"50211": "kuda.com",
	"50515": "moniepoint.com",
	"999992": "opayweb.com",
	"999991": "palmpay.com",
	"076": "polarisbanklimited.com",
	"101": "providusbank.com",
	"221": "stanbicibtcbank.com",
	"068": "sc.com",
	"232": "sterling.ng",
	"100": "suntrustng.com",
	"102": "titantrustbank.com",
	"032": "unionbankng.com",
	"033": "ubagroup.com",
	"215": "unitybankng.com",
	"035": "wemabank.com",
	"057": "zenithbank.com",
};

export function getBankLogoUrl(bank: Bank) {
	if (bank.logo) return bank.logo;
	const domain = BANK_LOGO_DOMAINS[bank.code];
	return domain ? `https://logo.clearbit.com/${domain}` : undefined;
}
