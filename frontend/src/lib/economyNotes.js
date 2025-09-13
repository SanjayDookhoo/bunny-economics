export const preNotes = {
	blessings: [
		'Yes! The economy has improved! Bells bless us all!',
		'A mighty hop forward! Carrot GDP is booming!',
		'Hooray! More bells, more carrots, more joy!',
		'Fantastic! The PPF just hopped outward.',
		'The invisible paw approves this growth.',
	],
	challenges: [
		'Oh no… did we do our best this time?',
		'Uh-oh, fewer hops, fewer carrots. Tough times ahead.',
		'Oh dear… the economy wobbled like a shaky bell.',
		'This recession is brought to you by clumsy paws.',
		'The bells were less bouncy today. Citizens grumble.',
	],
	neutral: [
		'It’s fineeeee… steady paws, steady growth.',
		'No change, no collapse. Balance, like a bunny on a bell.',
		'Could be better, could be worse. Stability is a blessing too.',
		'The economy just… chilled. Nothing new under the bunny sun.',
		'Neutral hops today. Carrot count unchanged.',
	],
};

export const economyFocusedNotes = {
	blessings: [
		{
			title: 'Labor Expansion',
			effect: 'A larger labor force increases productive capacity.',
			flavor:
				'A wave of skilled immigrants arrived, increasing the labor force. The PPF shifts outward.',
		},
		{
			title: 'Technological Progress',
			effect: 'More output with the same resources.',
			flavor:
				'A new technology improves productivity, allowing more goods and services to be produced.',
		},
		{
			title: 'Capital Investment',
			effect: 'New factories and equipment raise future capacity.',
			flavor:
				"Businesses invested heavily in new capital, expanding the economy's potential.",
		},
		{
			title: 'Education Boost',
			effect: 'Increased human capital raises efficiency.',
			flavor:
				'Government funding improved schools, making workers more productive.',
		},
		{
			title: 'Infrastructure Development',
			effect: 'Reduced transaction and trade costs.',
			flavor:
				'A new highway and port opened, boosting trade and transport efficiency.',
		},
		{
			title: 'Health Improvements',
			effect: 'Healthier workers improve productivity.',
			flavor:
				'Healthcare access expanded, raising the health and strength of the labor force.',
		},
		{
			title: 'Trade Liberalization',
			effect: 'Tariff reduction boosts imports and exports.',
			flavor: 'Lower tariffs improved trade flows, enhancing economic welfare.',
		},
		{
			title: 'Innovation Incentives',
			effect: 'R&D grants spark technological advances.',
			flavor: 'Research funding drove new innovations, accelerating growth.',
		},
		{
			title: 'Natural Resource Discovery',
			effect: 'New resources boost input supply.',
			flavor: 'A discovery of oil and minerals increased productive capacity.',
		},
		{
			title: 'Political Stability',
			effect: 'Higher investor confidence and capital inflows.',
			flavor: 'Stable governance improved confidence, attracting investment.',
		},
		{
			title: 'Foreign Direct Investment (FDI)',
			effect: 'New jobs and technology inflows.',
			flavor:
				'Multinational companies built factories and offices, creating jobs and knowledge spillovers.',
		},
		{
			title: 'Entrepreneurship Boom',
			effect: 'Start-ups drive innovation and competition.',
			flavor:
				'A wave of start-ups flourished, sparking creativity and economic growth.',
		},
		{
			title: 'Specialization Gains',
			effect: 'Efficiency improves through comparative advantage.',
			flavor:
				'Workers specialized in their strengths, raising overall productivity.',
		},
		{
			title: 'Economies of Scale',
			effect: 'Large-scale production lowers costs.',
			flavor: 'Bigger factories reduced per-unit costs, boosting efficiency.',
		},
		{
			title: 'Consumer Confidence Rise',
			effect: 'More spending stimulates output.',
			flavor: 'Households felt secure and increased spending, fueling growth.',
		},
		{
			title: 'Monetary Stability',
			effect: 'Low inflation encourages saving and investment.',
			flavor:
				'Stable prices improved trust in the economy and supported planning.',
		},
		{
			title: 'Green Technology Adoption',
			effect: 'Renewables improve sustainability.',
			flavor:
				'Renewable energy adoption lowered costs and built a cleaner economy.',
		},
		{
			title: 'International Trade Deal',
			effect: 'New markets open to exports.',
			flavor:
				'A free trade agreement expanded opportunities for producers abroad.',
		},
		{
			title: 'Productivity Miracle',
			effect: 'Output per worker jumps.',
			flavor: 'Automation and AI adoption dramatically raised productivity.',
		},
		{
			title: 'Social Capital Growth',
			effect: 'Trust and cooperation improve economic interactions.',
			flavor:
				'Stronger community ties boosted cooperation, efficiency, and trade.',
		},
	],
	challenges: [
		{
			title: 'Higher Tariffs',
			effect: 'Exports fall, prices rise.',
			flavor:
				'Government raised tariffs, shrinking exports and raising consumer prices.',
		},
		{
			title: 'Recessionary Shock',
			effect: 'Falling demand and higher unemployment.',
			flavor: 'Demand dropped sharply, unemployment rose, and output declined.',
		},
		{
			title: 'Inflation Surge',
			effect: 'Consumer purchasing power falls.',
			flavor: 'Prices spiked across the economy, reducing living standards.',
		},
		{
			title: 'Currency Depreciation',
			effect: 'Imports more expensive, living standards fall.',
			flavor: 'The currency weakened, making imported goods costlier.',
		},
		{
			title: 'Brain Drain',
			effect: 'Loss of skilled workers reduces productivity.',
			flavor:
				'Talented workers migrated abroad, weakening the domestic economy.',
		},
		{
			title: 'Natural Disaster',
			effect: 'Infrastructure and supply chains disrupted.',
			flavor:
				'A hurricane struck, damaging infrastructure and reducing output.',
		},
		{
			title: 'Political Instability',
			effect: 'Investment confidence falls.',
			flavor: 'Unrest created uncertainty, slowing economic growth.',
		},
		{
			title: 'Resource Depletion',
			effect: 'Reliance on imports grows.',
			flavor: 'A key resource ran out, forcing costly reliance on imports.',
		},
		{
			title: 'Trade Sanctions',
			effect: 'Exports restricted.',
			flavor: 'Other countries imposed sanctions, reducing export markets.',
		},
		{
			title: 'Debt Crisis',
			effect: 'Public services cut due to austerity.',
			flavor: 'Rising debt forced painful austerity measures.',
		},
		{
			title: 'Stagflation',
			effect: 'High inflation and unemployment together.',
			flavor:
				'Prices rose while jobs were scarce, creating a stagnant economy.',
		},
		{
			title: 'Trade Deficit Expansion',
			effect: 'Foreign reserves drain as imports rise.',
			flavor: 'Imports outweighed exports, creating a large deficit.',
		},
		{
			title: 'Tax Hikes',
			effect: 'Lower disposable income and reduced investment.',
			flavor:
				'Higher taxes reduced household spending and discouraged business growth.',
		},
		{
			title: 'Shadow Economy Growth',
			effect: 'Lower government revenue.',
			flavor: 'Underground markets expanded, reducing tax collection.',
		},
		{
			title: 'Hyperinflation Threat',
			effect: 'Purchasing power collapses.',
			flavor: 'Prices spiraled out of control, eroding wealth daily.',
		},
		{
			title: 'Capital Flight',
			effect: 'Weakens banks and currency.',
			flavor: 'Investors pulled funds abroad, destabilizing the economy.',
		},
		{
			title: 'Monopoly Power',
			effect: 'Reduced competition lowers welfare.',
			flavor: 'A single firm dominated, raising prices and limiting choice.',
		},
		{
			title: 'Aging Population',
			effect: 'Fewer workers support more retirees.',
			flavor:
				'An aging population strained public finances and reduced growth.',
		},
		{
			title: 'Brain Drain Intensifies',
			effect: 'Innovation capacity weakens further.',
			flavor:
				'Even more skilled workers emigrated, leaving the economy behind.',
		},
		{
			title: 'Climate Shock',
			effect: 'Agriculture disrupted and food prices rise.',
			flavor:
				'A severe drought cut yields, raising prices and hurting consumers.',
		},
	],
};

export const bunnyFocusedNotes = {
	blessings: [
		{
			title: 'More Bunny Labor Hops In',
			effect: 'PPF shifts outward with a larger workforce.',
			flavor:
				'A whole warren of bunnies joined the workforce. The economy hops ahead!',
		},
		{
			title: 'Carrot-Tech Innovation',
			effect: 'Higher productivity through technology.',
			flavor:
				'New carrot-cutting machines double bunny efficiency. Future looks tasty.',
		},
		{
			title: 'Bell Exports Increase',
			effect: 'Trade surplus achieved.',
			flavor:
				'Other countries discovered bell-hopping. Bunnies now run an export empire.',
		},
		{
			title: 'Infrastructure Burrow Upgrade',
			effect: 'Lower transport costs.',
			flavor: 'Tunnels widened. Burrow-to-burrow shipping is faster than ever.',
		},
		{
			title: 'Education Boom',
			effect: 'Increased human (bunny) capital.',
			flavor:
				'Every bunny took night classes on advanced hopping. Smarter hops, stronger economy.',
		},
		{
			title: 'Healthcare Blessing',
			effect: 'Higher life expectancy and productivity.',
			flavor:
				'Extra carrots in the diet. Bunnies are healthier and living longer.',
		},
		{
			title: 'Foreign Direct Invest-hops',
			effect: 'New capital and technology inflows.',
			flavor: 'Big bunny conglomerates built carrot factories in your burrow.',
		},
		{
			title: 'Green Growth',
			effect: 'Sustainable productivity boost.',
			flavor:
				'Bunnies switched to renewable hay energy. The future is green and fluffy.',
		},
		{
			title: 'Comparative Advan-hop-tage',
			effect: 'Specialization increases efficiency.',
			flavor: 'You hopped bells while neighbors grew lettuce. Everyone wins.',
		},
		{
			title: 'Bunny Spirit of Cooperation',
			effect: 'Higher social capital.',
			flavor:
				"Trust among bunnies improves. Trade flows as smoothly as a bunny's hop.",
		},
	],
	challenges: [
		{
			title: 'Carrot Shortage',
			effect: 'Food prices rise.',
			flavor:
				'Not enough carrots this season. Inflation in bunny snacks skyrockets.',
		},
		{
			title: 'Tariff Trouble',
			effect: 'Exports decline.',
			flavor:
				'Neighboring squirrels raised tariffs on bell imports. Exports suffer.',
		},
		{
			title: 'Burrow Brain Drain',
			effect: 'Loss of skilled labor.',
			flavor: 'Smart bunnies hopped abroad. Domestic innovation slows.',
		},
		{
			title: 'Natural Disaster',
			effect: 'Infrastructure damage.',
			flavor: 'A storm flooded tunnels. Bunny infrastructure is soggy.',
		},
		{
			title: 'Recessionary Rabbit Hole',
			effect: 'Falling demand and rising unemployment.',
			flavor:
				'Demand for bell-hopping entertainment drops. Warren unemployment rises.',
		},
		{
			title: 'Monopoly of the Bells',
			effect: 'Reduced competition and welfare.',
			flavor: 'One big bunny claims all the bells. Consumers lose joy.',
		},
		{
			title: 'Aging Warren',
			effect: 'Higher dependency ratio.',
			flavor:
				'Too many old bunnies, not enough young hoppers. Economic burden rises.',
		},
		{
			title: 'Currency Depreciation',
			effect: 'Imports more expensive.',
			flavor: 'The Bunnybuck weakens. Imported lettuce gets pricier.',
		},
		{
			title: 'Tariff Tantrum',
			effect: 'Export losses.',
			flavor: 'Foxes impose high tariffs on carrot exports. Bunny GDP falls.',
		},
		{
			title: 'Climate Hop-shock',
			effect: 'Lower agricultural yields.',
			flavor:
				'Drought reduces carrot harvest. Food prices spike across the warren.',
		},
	],
};

export const esistentialBunnyNotes = [
	{
		title: null,
		effect: null,
		flavor:
			"Why do I hop on bells? To push the economy forward… or just because they're shiny?",
	},
	{
		title: null,
		effect: null,
		flavor:
			'If a bunny hops on a bell in the forest, does it still shift the PPF?',
	},
	{
		title: null,
		effect: null,
		flavor: 'Every bell I hop on is one more carrot for the GDP.',
	},
	{
		title: null,
		effect: null,
		flavor: 'I am but a small bunny… yet my hops bless entire economies.',
	},
	{
		title: null,
		effect: null,
		flavor: 'Are these bells supply, demand… or just fun?',
	},
	{
		title: null,
		effect: null,
		flavor: 'Maybe life is just bells, hops, and carrots.',
	},
	{
		title: null,
		effect: null,
		flavor: 'The invisible paw guides my hops.',
	},
];
