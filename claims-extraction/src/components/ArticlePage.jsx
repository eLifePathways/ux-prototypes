import Nav from './Nav.jsx'
import React, { useState, useEffect, useRef } from 'react'
import { DownloadIcon, QuoteIcon, FiguresIcon, DatasetIcon, SupplementaryIcon, OxaArrowUpIcon, OxaArrowDownIcon, OxaChevronLeftIcon, OxaCloseIcon } from './Icons.jsx'
import MdastRenderer, { flattenText } from './MdastRenderer.jsx'
import { articleMeta, articleSections, articleFigures as STATIC_FIGURES } from '../articleSections.js'

const IMAGE_BASE = 'https://reader.openrxivlabs.org'

const INTERACTIVE_CONDITIONS = [
  { id: 'acq-cs-plus',  label: 'Acquisition CS+',  shortLabel: 'Acq CS+',  hue: 0 },
  { id: 'acq-cs-minus', label: 'Acquisition CS−',  shortLabel: 'Acq CS−',  hue: 200 },
  { id: 'rev-cs-plus',  label: 'Reversal CS+',     shortLabel: 'Rev CS+',  hue: 100 },
  { id: 'rev-cs-minus', label: 'Reversal CS−',     shortLabel: 'Rev CS−',  hue: 270 },
]

// Approximate % positions on the brain-scan figure image
const BRAIN_HOTSPOTS = [
  { id: 'dacc',    x: 50, y: 22, label: 'Dorsal ACC',       detail: 'Strongest CS generalisation effect across phases' },
  { id: 'vmpfc',   x: 50, y: 35, label: 'vmPFC',            detail: 'Fear extinction and contingency re-learning' },
  { id: 'amyg-l',  x: 33, y: 54, label: 'Left Amygdala',    detail: 'Threat-cue similarity encoding, acquisition phase' },
  { id: 'amyg-r',  x: 67, y: 54, label: 'Right Amygdala',   detail: 'Threat-cue similarity encoding, reversal phase' },
  { id: 'hipp',    x: 42, y: 67, label: 'Hippocampus',      detail: 'Context-dependent memory for CS–US contingencies' },
  { id: 'insula',  x: 24, y: 44, label: 'Anterior Insula',  detail: 'Interoceptive fear response and US expectancy' },
]

// ── Mention extraction ────────────────────────────────────────
// Walk mdast body; collect paragraphs that contain a crossReference
// pointing at figureHtmlId. Returns [{section, node}].
function hasCrossRef(node, htmlId) {
  if (node.type === 'crossReference' && node.html_id === htmlId) return true
  return (node.children || []).some(c => hasCrossRef(c, htmlId))
}
function extractMentions(mdastChildren, figureHtmlId) {
  if (!figureHtmlId) return []
  const results = []
  let currentSection = null
  function walk(nodes) {
    for (const n of nodes || []) {
      if (n.type === 'heading') { currentSection = flattenText(n); continue }
      if (n.type === 'paragraph' && hasCrossRef(n, figureHtmlId)) {
        results.push({ section: currentSection, node: n })
      }
      if (n.children) walk(n.children)
    }
  }
  walk(mdastChildren)
  return results
}

// eLife assessment data for this article (10.7554/eLife.105126)
const ELIFE_ASSESSMENT = {
  significance: 'Important',
  strength: 'Convincing',
  summary: 'This is an <strong>important</strong> study providing <strong>convincing</strong> evidence that the insula and superior temporal sulcus play distinct roles in interpersonal guilt and responsibility during social decision-making. The computational modelling approach is rigorous and the fMRI findings are well-grounded in prior literature. The work advances our understanding of the neural substrates of prosocial emotions and their relationship to choices in social contexts.',
  reviewingEditor: 'Thorsten Kahnt',
  reviewingEditorInstitution: 'National Institutes of Health, USA',
  seniorEditor: 'Michael Frank',
  seniorEditorInstitution: 'Brown University, USA',
}

const SIG_DOTS = { Landmark: 5, Fundamental: 4, Important: 3, Valuable: 2, Useful: 1 }
const STR_DOTS = { Exceptional: 5, Compelling: 4, Convincing: 3, Solid: 2, Incomplete: 1 }
const TIMELINE = [
  {
    version: 3,
    label: 'Version of Record published',
    currentLabel: 'Version of Record declared',
    date: 'March 24, 2026',
    events: []
  },
  {
    version: 2,
    label: 'Version 2 published',
    currentLabel: 'Version 2 published',
    date: 'November 14, 2025',
    events: [
      { title: 'eLife Assessment updated', date: 'October 22, 2025' },
      { title: 'Peer reviews updated', date: 'October 15, 2025' },
      { title: 'Version 2 submitted', date: 'October 1, 2025' },
    ]
  },
  {
    version: 1,
    label: 'Version 1 published',
    currentLabel: 'Version 1 published',
    date: 'June 18, 2025',
    events: [
      { title: 'Author response', date: 'May 12, 2025' },
      { title: 'Peer reviewed', date: 'April 28, 2025' },
    ]
  },
  {
    version: null,
    label: 'Preprint posted',
    currentLabel: 'Preprint posted',
    date: 'March 3, 2025',
    events: [
      { title: 'Sent for peer review', date: 'March 3, 2025' },
    ]
  }
]


function wrapLastWord(html) {
  return html.replace(/(\S+)(\s*(?:<\/\w+>\s*)*)$/, '<span class="assessment-last-word">$1</span>$2')
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function getFigureType(_enumerator) {
  return 'default'
}

// No image overrides for this prototype
const FIGURE_IMAGE_OVERRIDES = {}


// Figure IDs that appear after each section
const SECTION_FIGURES = {
  'introduction': ['fig1'],
  'results-choices-risk': ['fig2'],
  'results-happiness-guilt': ['fig3', 'fig3s1'],
  'results-bold-outcomes': ['fig4'],
  'results-bold-connectivity': ['fig5', 'fig5s1'],
}

// Hardcoded references for Gädeke et al. 2026 (eLife 105391)
const STATIC_REFS = [
  { key: 'arioli2023', idx: 0, pattern: 'Arioli et al., 2023', html: 'Arioli M, Crespi C, Canessa N. (2023). Social cognition through the lens of cognitive and clinical neuroscience. <i>Cerebral Cortex</i>. 33:6571–6596.', url: 'https://doi.org/10.1093/cercor/bhad025' },
  { key: 'bastin2016', idx: 1, pattern: 'Bastin et al., 2016', html: 'Bastin C, Harrison BJ, Davey CG, Moll J, Whittle S. (2016). Feelings of shame, embarrassment and guilt and their neural correlates: A meta-analysis. <i>Neuroscience & Biobehavioral Reviews</i>. 71:455–471.', url: 'https://doi.org/10.1016/j.neubiorev.2016.09.019' },
  { key: 'bates2015', idx: 2, pattern: 'Bates et al., 2015', html: 'Bates D, Mächler M, Bolker B, Walker S. (2015). Fitting linear mixed-effects models using lme4. <i>Journal of Statistical Software</i>. 67:1–48.', url: 'https://doi.org/10.18637/jss.v067.i01' },
  { key: 'batteux2019', idx: 3, pattern: 'Batteux et al., 2019', html: 'Batteux E, Ferguson E, Tunney RJ. (2019). Do our risk preferences change when we make decisions for others? A meta-analysis of self–other differences in decisions involving risk. <i>PLOS ONE</i>. 14:e0216566.', url: 'https://doi.org/10.1371/journal.pone.0216566' },
  { key: 'battigalli2007', idx: 4, pattern: 'Battigalli and Dufwenberg, 2007', html: 'Battigalli P, Dufwenberg M. (2007). Guilt in games. <i>American Economic Review</i>. 97:170–176.', url: 'https://doi.org/10.1257/aer.97.2.170' },
  { key: 'baumeister1998', idx: 5, pattern: 'Baumeister, 1998', html: 'Baumeister RF. (1998). Inducing guilt. In J Bybee (Ed.), <i>Guilt and Children</i> (pp. 185–213). Academic Press.', url: 'https://doi.org/10.1016/B978-012148610-5/50007-2' },
  { key: 'baumeister1994', idx: 6, pattern: 'Baumeister et al., 1994', html: 'Baumeister RF, Stillwell AM, Heatherton TF. (1994). Guilt: An interpersonal approach. <i>Psychological Bulletin</i>. 115:243–267.', url: 'https://doi.org/10.1037/0033-2909.115.2.243' },
  { key: 'berndsen2004', idx: 7, pattern: 'Berndsen et al., 2004', html: 'Berndsen M, van der Pligt J, Doosje B, Manstead ASR. (2004). Guilt and regret: The determining role of interpersonal and intrapersonal harm. <i>Cognition & Emotion</i>. 18:55–70.', url: 'https://doi.org/10.1080/02699930244000435' },
  { key: 'bird2010', idx: 8, pattern: 'Bird et al., 2010', html: 'Bird G, Silani G, Brindley R, White S, Frith U, Singer T. (2010). Empathic brain responses in insula are modulated by levels of alexithymia but not autism. <i>Brain</i>. 133:1515–1525.', url: 'https://doi.org/10.1093/brain/awq060' },
  { key: 'craig2009', idx: 9, pattern: 'Craig, 2009', html: 'Craig AD. (2009). How do you feel—now? The anterior insula and human awareness. <i>Nature Reviews Neuroscience</i>. 10:59–70.', url: 'https://doi.org/10.1038/nrn2555' },
  { key: 'carter2012', idx: 10, pattern: 'Carter et al., 2012', html: 'Carter RM, Bowling DL, Reeck C, Huettel SA. (2012). A distinct role of the temporal-parietal junction in predicting socially guided decisions. <i>Science</i>. 337:109–111.', url: 'https://doi.org/10.1126/science.1219681' },
  { key: 'chang2011', idx: 11, pattern: 'Chang et al., 2011', html: 'Chang LJ, Smith A, Dufwenberg M, Sanfey AG. (2011). Triangulating the neural, psychological, and economic bases of guilt aversion. <i>Neuron</i>. 70:560–572.', url: 'https://doi.org/10.1016/j.neuron.2011.02.056' },
  { key: 'charness2006', idx: 12, pattern: 'Charness and Dufwenberg, 2006', html: 'Charness G, Dufwenberg M. (2006). Promises and partnership. <i>Econometrica</i>. 74:1579–1601.', url: 'https://doi.org/10.1111/j.1468-0262.2006.00719.x' },
  { key: 'charpentier2018', idx: 13, pattern: "Charpentier and O\'Doherty, 2018", html: "Charpentier CJ, O\'Doherty JP. (2018). The application of computational models to social neuroscience. <i>Social Neuroscience</i>. 13:626–633.", url: 'https://doi.org/10.1080/17470919.2018.1518834' },
  { key: 'chau2018', idx: 14, pattern: 'Chau et al., 2018', html: 'Chau BKH, Kolling N, Hunt LT, Behrens TEJ, Rushworth MFS. (2018). A neural mechanism underlying failure of optimal choice with multiple alternatives. <i>Neuropsychologia</i>. 120:93–103.', url: 'https://doi.org/10.1016/j.neuropsychologia.2018.07.002' },
  { key: 'craig2002', idx: 15, pattern: 'Craig, 2002', html: 'Craig AD. (2002). How do you feel? Interoception: The sense of the physiological condition of the body. <i>Nature Reviews Neuroscience</i>. 3:655–666.', url: 'https://doi.org/10.1038/nrn894' },
  { key: 'cui2022', idx: 16, pattern: 'Cui et al., 2022', html: 'Cui F, Abdelgabar AR, Keysers C, Gazzola V. (2022). Changes in functional connectivity but not grey matter underlie cognitive reappraisal of pain in others. <i>Neuroscience & Biobehavioral Reviews</i>. 137:104851.', url: 'https://doi.org/10.1016/j.neubiorev.2022.104851' },
  { key: 'edelson2018', idx: 17, pattern: 'Edelson et al., 2018', html: 'Edelson MG, Polania R, Ruff CC, Fehr E, Hare TA. (2018). Computational and neurobiological foundations of leadership decisions. <i>Science</i>. 361:eaat0036.', url: 'https://doi.org/10.1126/science.aat0036' },
  { key: 'faillenot2017', idx: 18, pattern: 'Faillenot et al., 2017', html: 'Faillenot I, Heckemann RA, Frot M, Hammers A. (2017). Macroanatomy and 3D probabilistic atlas of the human insula. <i>NeuroImage</i>. 150:88–98.', url: 'https://doi.org/10.1016/j.neuroimage.2017.01.073' },
  { key: 'fareri2012', idx: 19, pattern: 'Fareri et al., 2012', html: 'Fareri DS, Chang LJ, Delgado MR. (2012). Effects of direct social experience on trust decisions and neural reward circuitry. <i>Frontiers in Neuroscience</i>. 6:148.', url: 'https://doi.org/10.3389/fnins.2012.00148' },
  { key: 'fareri2022', idx: 20, pattern: 'Fareri et al., 2022', html: 'Fareri DS, Snyder SH, Li J, Delgado MR. (2022). Social network modulation of reward-related signals. <i>Scientific Reports</i>. 12:14481.', url: 'https://doi.org/10.1038/s41598-022-18437-9' },
  { key: 'faul2007', idx: 21, pattern: 'Faul et al., 2007', html: 'Faul F, Erdfelder E, Lang AG, Buchner A. (2007). G*Power 3: A flexible statistical power analysis program for the social, behavioral, and biomedical sciences. <i>Behavior Research Methods</i>. 39:175–191.', url: 'https://doi.org/10.3758/BF03193146' },
  { key: 'frith2014', idx: 22, pattern: 'Frith, 2014', html: 'Frith CD. (2014). Action, agency and responsibility. <i>Neuropsychologia</i>. 55:137–142.', url: 'https://doi.org/10.1016/j.neuropsychologia.2013.09.007' },
  { key: 'frithfrith2006', idx: 23, pattern: 'Frith and Frith, 2006', html: 'Frith CD, Frith U. (2006). The neural basis of mentalizing. <i>Neuron</i>. 50:531–534.', url: 'https://doi.org/10.1016/j.brainres.2005.12.126' },
  { key: 'gao2018', idx: 24, pattern: 'Gao et al., 2018', html: 'Gao X, Yu H, Sáez I, Blue PR, Zhu L, Hsu M, Zhou X. (2018). Distinguishing neural correlates of context-dependent advantageous- and disadvantageous-inequity aversion. <i>PNAS</i>. 115:7680–7685.', url: 'https://doi.org/10.1073/pnas.1802523115' },
  { key: 'gifuni2017', idx: 25, pattern: 'Gifuni et al., 2017', html: 'Gifuni AJ, Kendal A, Jollant F. (2017). Neural mapping of guilt: A quantitative meta-analysis of functional imaging studies. <i>Brain Imaging and Behavior</i>. 11:1164–1176.', url: 'https://doi.org/10.1007/s11682-016-9606-6' },
  { key: 'gong2019', idx: 26, pattern: 'Gong et al., 2019', html: 'Gong X, Brazil IA, Chang LJ, Sanfey AG. (2019). Psychopathic traits are related to diminished guilt aversion and reduced demand for third-party punishment. <i>Scientific Reports</i>. 9:7258.', url: 'https://doi.org/10.1038/s41598-019-43727-0' },
  { key: 'gu2012', idx: 27, pattern: 'Gu et al., 2012', html: 'Gu X, Gao Z, Wang X, Liu X, Knight RT, Hof PR, Fan J. (2012). Anterior insular cortex is necessary for empathetic pain perception. <i>Brain</i>. 135:2726–2735.', url: 'https://doi.org/10.1093/brain/aws199' },
  { key: 'gu2013', idx: 28, pattern: 'Gu et al., 2013', html: 'Gu X, Hof PR, Friston KJ, Fan J. (2013). Anterior insular cortex and emotional awareness. <i>Journal of Comparative Neurology</i>. 521:3371–3388.', url: 'https://doi.org/10.1002/cne.23368' },
  { key: 'hampton2008', idx: 29, pattern: 'Hampton et al., 2008', html: 'Hampton AN, Bossaerts P, O\'Doherty JP. (2008). Neural correlates of mentalizing-related computations during strategic interactions in humans. <i>PNAS</i>. 105:6741–6746.', url: 'https://doi.org/10.1073/pnas.0711099105' },
  { key: 'hill2017', idx: 30, pattern: 'Hill et al., 2017', html: 'Hill CA, Suzuki S, Polania R, Moisa M, O\'Doherty JP, Ruff CC. (2017). A causal account of the brain network computations underlying strategic social behavior. <i>Nature Neuroscience</i>. 20:1142–1149.', url: 'https://doi.org/10.1038/nn.4602' },
  { key: 'hutcherson2015', idx: 31, pattern: 'Hutcherson et al., 2015', html: 'Hutcherson CA, Bushong B, Rangel A. (2015). A neurocomputational model of altruistic choice and its implications. <i>Neuron</i>. 87:451–462.', url: 'https://doi.org/10.1016/j.neuron.2015.06.031' },
  { key: 'ifcher2020', idx: 32, pattern: 'Ifcher and Zarghamee, 2020', html: 'Ifcher J, Zarghamee H. (2020). Behavioral economic phenomena in decision-making for others. <i>Journal of Economic Psychology</i>. 77:102207.', url: 'https://doi.org/10.1016/j.joep.2019.06.003' },
  { key: 'julledaniere2020', idx: 33, pattern: 'Julle-Danière et al., 2020', html: 'Julle-Danière E, Whitehouse J, Vrij A, Gustafsson E, Waller BM. (2020). The social function of the feeling and expression of guilt. <i>Royal Society Open Science</i>. 7:200617.', url: 'https://doi.org/10.1098/rsos.200617' },
  { key: 'jung2013', idx: 34, pattern: 'Jung et al., 2013', html: 'Jung D, Sul S, Kim H. (2013). Dissociable neural processes underlying risky decisions for self versus others. <i>Frontiers in Neuroscience</i>. 7:15.', url: 'https://doi.org/10.3389/fnins.2013.00015' },
  { key: 'kahneman1979', idx: 35, pattern: 'Kahneman and Tversky, 1979', html: 'Kahneman D, Tversky A. (1979). Prospect theory: An analysis of decision under risk. <i>Econometrica</i>. 47:263–291.', url: 'https://www.jstor.org/stable/1914185' },
  { key: 'koban2013', idx: 36, pattern: 'Koban et al., 2013', html: "Koban L, Corradi-Dell\'Acqua C, Vuilleumier P. (2013). Integration of error agency and representation of others' pain in the anterior insula. <i>Journal of Cognitive Neuroscience</i>. 25:258–272.", url: 'https://doi.org/10.1162/jocn_a_00324' },
  { key: 'konovalov2021a', idx: 37, pattern: 'Konovalov et al., 2021', html: 'Konovalov A, Hill C, Daunizeau J, Ruff CC. (2021). Dissecting functional contributions of the social brain to strategic behavior. <i>Neuron</i>. 109:3323–3337.', url: 'https://doi.org/10.1016/j.neuron.2021.07.025' },
  { key: 'konovalov2021b', idx: 38, pattern: 'Konovalov and Ruff, 2021', html: 'Konovalov A, Ruff CC. (2021). Enhancing models of social and strategic decision making with process tracing and neural data. <i>WIREs Cognitive Science</i>. 12:e1559.', url: 'https://doi.org/10.1002/wcs.1559' },
  { key: 'krajbich2009', idx: 39, pattern: 'Krajbich et al., 2009', html: 'Krajbich I, Adolphs R, Tranel D, Denburg NL, Camerer CF. (2009). Economic games quantify diminished sense of guilt in patients with damage to the prefrontal cortex. <i>Journal of Neuroscience</i>. 29:2188–2192.', url: 'https://doi.org/10.1523/JNEUROSCI.5086-08.2009' },
  { key: 'lamm2011', idx: 40, pattern: 'Lamm et al., 2011', html: 'Lamm C, Decety J, Singer T. (2011). Meta-analytic evidence for common and distinct neural networks associated with directly experienced pain and empathy for pain. <i>NeuroImage</i>. 54:2492–2502.', url: 'https://doi.org/10.1016/j.neuroimage.2010.10.014' },
  { key: 'lamm2010', idx: 41, pattern: 'Lamm and Singer, 2010', html: 'Lamm C, Singer T. (2010). The role of anterior insular cortex in social emotions. <i>Brain Structure and Function</i>. 214:579–591.', url: 'https://doi.org/10.1007/s00429-010-0251-3' },
  { key: 'loewenstein1989', idx: 42, pattern: 'Loewenstein et al., 1989', html: 'Loewenstein GF, Thompson L, Bazerman MH. (1989). Social utility and decision making in interpersonal contexts. <i>Journal of Personality and Social Psychology</i>. 57:426–441.', url: 'https://doi.org/10.1037/0022-3514.57.3.426' },
  { key: 'mclaren2012', idx: 43, pattern: 'McLaren et al., 2012', html: 'McLaren DG, Ries ML, Xu G, Johnson SC. (2012). A generalized form of context-dependent psychophysiological interactions (gPPI): A comparison to standard approaches. <i>NeuroImage</i>. 61:1277–1286.', url: 'https://doi.org/10.1016/j.neuroimage.2012.03.020' },
  { key: 'nicolle2012', idx: 44, pattern: 'Nicolle et al., 2012', html: 'Nicolle A, Klein-Flügge MC, Hunt LT, Vlaev I, Dolan RJ, Behrens TEJ. (2012). An agent independent axis for executed and modeled choice in medial prefrontal cortex. <i>Neuron</i>. 75:1114–1121.', url: 'https://doi.org/10.1016/j.neuron.2012.07.023' },
  { key: 'odoherty2004', idx: 45, pattern: "O\'Doherty et al., 2004", html: "O\'Doherty JP, Dayan P, Schultz J, Deichmann R, Friston K, Dolan RJ. (2004). Dissociable roles of ventral and dorsal striatum in instrumental conditioning. <i>Science</i>. 304:452–454.", url: 'https://doi.org/10.1126/science.1094285' },
  { key: 'odoherty2007', idx: 46, pattern: "O\'Doherty et al., 2007", html: "O\'Doherty JP, Hampton A, Kim H. (2007). Model-based fMRI and its application to reward learning and decision making. <i>Annals of the New York Academy of Sciences</i>. 1104:35–53.", url: 'https://doi.org/10.1196/annals.1390.022' },
  { key: 'ogawa2018', idx: 47, pattern: 'Ogawa et al., 2018', html: 'Ogawa A, Ueshima A, Inukai K, Kameda T. (2018). Deciding for others as a neutral party recruits risk-neutral perspective-taking. <i>Scientific Reports</i>. 8:12857.', url: 'https://doi.org/10.1038/s41598-018-31308-6' },
  { key: 'pahlke2015', idx: 48, pattern: 'Pahlke et al., 2015', html: 'Pahlke J, Strasser S, Vieider FM. (2015). Responsibility effects in decision making under risk. <i>Journal of Risk and Uncertainty</i>. 51:125–146.', url: 'https://doi.org/10.1007/s11166-015-9223-6' },
  { key: 'piretti2023', idx: 49, pattern: 'Piretti et al., 2023', html: 'Piretti L, Pappaianni E, Garbin C, Rumiati RI, Job R, Grecucci A. (2023). The neural signatures of shame, embarrassment, guilt and pride: A quantitative meta-analysis. <i>Brain Sciences</i>. 13:559.', url: 'https://doi.org/10.3390/brainsci13040559' },
  { key: 'piva2019', idx: 50, pattern: 'Piva et al., 2019', html: 'Piva M, Velnoskey K, Jia R, Nair A, Levy I, Chang SW. (2019). The dorsomedial prefrontal cortex computes task-invariant cognitive signals for adaptive intertemporal choice. <i>eLife</i>. 8:e44939.', url: 'https://doi.org/10.7554/eLife.44939' },
  { key: 'polman2020', idx: 51, pattern: 'Polman and Wu, 2020', html: 'Polman E, Wu K. (2020). Decision making for others involving risk: A review and meta-analysis. <i>Journal of Economic Psychology</i>. 77:102184.', url: 'https://doi.org/10.1016/j.joep.2019.06.007' },
  { key: 'preuschoff2006', idx: 52, pattern: 'Preuschoff et al., 2006', html: 'Preuschoff K, Bossaerts P, Quartz SR. (2006). Neural differentiation of expected reward and risk in human subcortical structures. <i>Neuron</i>. 51:381–390.', url: 'https://doi.org/10.1016/j.neuron.2006.06.024' },
  { key: 'rogerscarter2019', idx: 53, pattern: 'Rogers-Carter and Christianson, 2019', html: 'Rogers-Carter MM, Christianson JP. (2019). An insular view of the social decision-making network. <i>Neuroscience & Biobehavioral Reviews</i>. 103:119–132.', url: 'https://doi.org/10.1016/j.neubiorev.2019.06.005' },
  { key: 'rutledge2016', idx: 54, pattern: 'Rutledge et al., 2016', html: 'Rutledge RB, De Berker AO, Espenhahn S, Dayan P, Dolan RJ. (2016). The social contingency of momentary subjective well-being. <i>Nature Communications</i>. 7:11825.', url: 'https://doi.org/10.1038/ncomms11825' },
  { key: 'rutledge2014', idx: 55, pattern: 'Rutledge et al., 2014', html: 'Rutledge RB, Skandali N, Dayan P, Dolan RJ. (2014). A computational and neural model of momentary subjective well-being. <i>PNAS</i>. 111:12252–12257.', url: 'https://doi.org/10.1073/pnas.1407535111' },
  { key: 'schultz2019', idx: 56, pattern: 'Schultz et al., 2019', html: 'Schultz J, Willems T, Gädeke M, Chakkour G, Franke A, Weber B, Hurlemann R. (2019). A human subcortical network underlying social aversion. <i>eLife</i>. 8:e45249.', url: 'https://doi.org/10.7554/eLife.45249' },
  { key: 'schurz2014', idx: 57, pattern: 'Schurz et al., 2014', html: 'Schurz M, Radua J, Aichhorn M, Richlan F, Perner J. (2014). Fractionating theory of mind: A meta-analysis of functional brain imaging studies. <i>Neuroscience & Biobehavioral Reviews</i>. 42:9–34.', url: 'https://doi.org/10.1016/j.neubiorev.2014.01.009' },
  { key: 'searacardoso2016', idx: 58, pattern: 'Seara-Cardoso et al., 2016', html: 'Seara-Cardoso A, Sebastian CL, McCrory E, Foulkes L, Buon M, Roiser JP, Viding E. (2016). Anticipation of guilt for everyday moral transgressions: The role of the anterior insula and the influence of psychopathic traits. <i>Scientific Reports</i>. 6:36273.', url: 'https://doi.org/10.1038/srep36273' },
  { key: 'singer2009', idx: 59, pattern: 'Singer et al., 2009', html: 'Singer T, Critchley HD, Preuschoff K. (2009). A common role of insula in feelings, empathy and uncertainty. <i>Trends in Cognitive Sciences</i>. 13:334–340.', url: 'https://doi.org/10.1016/j.tics.2009.05.001' },
  { key: 'tangney2007', idx: 60, pattern: 'Tangney et al., 2007', html: 'Tangney JP, Stuewig J, Mashek DJ. (2007). Moral emotions and moral behavior. <i>Annual Review of Psychology</i>. 58:345–372.', url: 'https://doi.org/10.1146/annurev.psych.56.091103.070145' },
  { key: 'tusche2016', idx: 61, pattern: 'Tusche et al., 2016', html: 'Tusche A, Böckler A, Kanske P, Trautwein FM, Singer T. (2016). Decoding the charitable brain: Empathy, perspective taking, and attention shifts differentially predict charitable giving. <i>Journal of Neuroscience</i>. 36:4719–4732.', url: 'https://doi.org/10.1523/JNEUROSCI.3392-15.2016' },
  { key: 'vanoverwalle2009', idx: 62, pattern: 'Van Overwalle, 2009', html: 'Van Overwalle F. (2009). Social cognition and the brain: A meta-analysis. <i>Human Brain Mapping</i>. 30:829–858.', url: 'https://doi.org/10.1002/hbm.20547' },
  { key: 'vongaudecker2011', idx: 63, pattern: 'von Gaudecker et al., 2011', html: 'von Gaudecker HM, van Soest A, Wengström E. (2011). Heterogeneity in risky choice behavior in a broad population. <i>American Economic Review</i>. 101:664–694.', url: 'https://doi.org/10.1257/aer.101.2.664' },
  { key: 'wicker2003', idx: 64, pattern: 'Wicker et al., 2003', html: 'Wicker B, Keysers C, Plailly J, Royet JP, Gallese V, Rizzolatti G. (2003). Both of us disgusted in my insula: The common neural basis of seeing and feeling disgust. <i>Neuron</i>. 40:655–664.', url: 'https://doi.org/10.1016/S0896-6273(03)00635-7' },
  { key: 'wu2021', idx: 65, pattern: 'Wu et al., 2021', html: 'Wu S, Sun S, Camilleri JA, Eickhoff SB, Yu R. (2021). Better the devil you know than the devil you don\'t: Neural processing of social decisions with uncertain versus certain outcomes. <i>NeuroImage</i>. 236:118109.', url: 'https://doi.org/10.1016/j.neuroimage.2021.118109' },
  { key: 'yu2014', idx: 66, pattern: 'Yu et al., 2014', html: 'Yu H, Hu J, Hu L, Zhou X. (2014). The voice of conscience: Neural bases of interpersonal guilt and compensation. <i>Social Cognitive and Affective Neuroscience</i>. 9:1150–1158.', url: 'https://doi.org/10.1093/scan/nst090' },
  { key: 'yu2020', idx: 67, pattern: 'Yu et al., 2020', html: 'Yu H, Koban L, Chang LJ, Wagner U, Krishnan A, Vuilleumier P, Zhou X, Wager TD. (2020). A generalizable multivariate brain pattern for interpersonal guilt. <i>Cerebral Cortex</i>. 30:3558–3572.', url: 'https://doi.org/10.1093/cercor/bhz326' },
  { key: 'zeelenberg2008', idx: 68, pattern: 'Zeelenberg and Breugelmans, 2008', html: 'Zeelenberg M, Breugelmans SM. (2008). The role of interpersonal harm in distinguishing regret from guilt. <i>Emotion</i>. 8:589–596.', url: 'https://doi.org/10.1037/a0012894' },
  { key: 'zhang2017', idx: 69, pattern: 'Zhang et al., 2017', html: 'Zhang X, Liu Y, Chen X, Shang X, Liu Y. (2017). Decisions for others are less risk-averse in the gain frame and less risk-seeking in the loss frame than decisions for the self. <i>Frontiers in Psychology</i>. 8:1601.', url: 'https://doi.org/10.3389/fpsyg.2017.01601' },
  { key: 'zhu2019', idx: 70, pattern: 'Zhu et al., 2019', html: 'Zhu R, Feng C, Zhang S, Mai X, Liu C. (2019). Differentiating guilt and shame in an interpersonal context with univariate morphometry and multivariate pattern analysis. <i>NeuroImage</i>. 186:476–486.', url: 'https://doi.org/10.1016/j.neuroimage.2018.11.012' },
]

// Map citation pattern text to ref for quick lookup
const REF_PATTERN_MAP = new Map(STATIC_REFS.map(r => [r.pattern, r]))

// Render a paragraph text string into React nodes with clickable figure/citation links
function renderParagraph(text, onFigureClick, onRefClick) {
  const RE = /\bFigure\s+(\d+)(?:\u2014figure supplement (\d+))?\b|\(([^)]{3,300})\)/g
  const parts = []
  let last = 0
  let m
  let key = 0
  while ((m = RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      const num = m[1]
      const sup = m[2]
      const figId = sup ? `fig${num}s${sup}` : `fig${num}`
      parts.push(
        React.createElement('span', {
          key: key++,
          className: 'inline-ref inline-ref--figure',
          onClick: () => onFigureClick && onFigureClick(figId),
        }, m[0])
      )
    } else if (m[3] !== undefined) {
      const inner = m[3]
      // Find first matching ref in the citation group
      const parts_inner = inner.split(';').map(s => s.trim())
      let foundRef = null
      for (const p of parts_inner) {
        // try direct match, or prefix match
        for (const [pattern, ref] of REF_PATTERN_MAP) {
          if (p.includes(pattern) || pattern.includes(p)) { foundRef = ref; break }
        }
        if (foundRef) break
      }
      if (foundRef && onRefClick) {
        parts.push(
          React.createElement('span', {
            key: key++,
            className: 'inline-ref inline-ref--cite',
            onClick: () => onRefClick(foundRef.idx),
          }, `(${inner})`)
        )
      } else {
        parts.push(`(${inner})`)
      }
    }
    last = RE.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}


function StaticFigure({ figId, onFigureClick }) {
  const fig = STATIC_FIGURES.find(f => f.id === figId)
  if (!fig) return null
  return (
    <figure
      className="article-figure"
      onClick={() => onFigureClick && onFigureClick(figId)}
      style={{ cursor: 'pointer' }}
    >
      <img src={fig.url} alt={fig.title} loading="lazy" style={{ maxWidth: '100%' }} />
      <figcaption>
        <strong>{fig.label}.</strong> {fig.title}.{' '}
        <span className="figure-caption-text">{fig.caption}</span>
      </figcaption>
    </figure>
  )
}

function StaticSection({ section, level = 2, onFigureClick, onRefClick }) {
  const Tag = `h${Math.min(level, 6)}`
  const postFigures = SECTION_FIGURES[section.id] || []
  return (
    <section id={section.id}>
      <Tag>{section.label}</Tag>
      {(section.paragraphs || []).map((para, i) => (
        <p key={i}>{renderParagraph(para, onFigureClick, onRefClick)}</p>
      ))}
      {postFigures.map(figId => (
        <StaticFigure key={figId} figId={figId} onFigureClick={onFigureClick} />
      ))}
      {(section.children || []).map(child => (
        <StaticSection key={child.id} section={child} level={level + 1} onFigureClick={onFigureClick} onRefClick={onRefClick} />
      ))}
    </section>
  )
}

export default function ArticlePage({ concepts = [], versionConfig = {} }) {
  // Static data (Gädeke et al. 2026)
  const frontmatter = {
    title: articleMeta.title,
    doi: articleMeta.doi,
    date: '2026-03-24',
    subject: 'Neuroscience',
    authors: articleMeta.authors.map((name, i) => ({
      id: `a${i}`, name, corresponding: i === 0, affiliations: [],
    })),
    affiliations: [],
    parts: {},
  }
  const references = null
  const figures = STATIC_FIGURES.map((f, i) => ({
    type: 'container', kind: 'figure',
    html_id: f.id, label: f.label, enumerator: String(i + 1),
    children: [
      { type: 'image', url: f.url, alt: f.title },
      { type: 'caption', children: [
        { type: 'paragraph', children: [{ type: 'text', value: `${f.label}. ${f.title}. ${f.caption || ''}` }] }
      ]},
    ],
  }))
  const tables = []
  const mdast = null
  const [showDetails, setShowDetails] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('abstract')
  const [modal, setModal] = useState(null) // null | { type, data }

  // Lock body scroll while any modal is open
  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track active section via IntersectionObserver
  useEffect(() => {
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '80', 10)
    const rootMargin = `-${navH + 8}px 0px -60% 0px`

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          )
          setActiveSection(top.target.id)
        }
      },
      { rootMargin, threshold: 0 }
    )

    const t = setTimeout(() => {
      document.querySelectorAll('.article-content section[id]').forEach(el => observer.observe(el))
    }, 100)

    return () => { clearTimeout(t); observer.disconnect() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Build nav from static article sections
  const bodyArticleSections = articleSections.filter(s => s.id !== 'abstract')
  const abstractSection = articleSections.find(s => s.id === 'abstract')
  const navSections = [
    { id: 'abstract', label: 'Abstract' },
    ...bodyArticleSections.map(s => ({ id: s.id, label: s.label })),
    { id: 'references', label: 'References' },
  ]

  function openFigure(htmlId) {
    const fig = figures.find(f => f.html_id === htmlId) || figures[0]
    setModal({ type: 'figure', data: fig })
  }
  function openTable(_htmlId) { /* no tables */ }
  function openReference(pattern) {
    const ref = STATIC_REFS.find(r => r.pattern === pattern)
    if (ref) setModal({ type: 'reference', data: ref })
  }
  function openReferenceByIndex(idx) {
    const ref = STATIC_REFS[idx]
    if (ref) setModal({ type: 'reference', data: ref })
  }

  // Affiliation lookup (empty for this paper)
  const affMap = {}

  return (
    <div className="article-page">
      <Nav
        scrolled={true}
        noBorder
        onLogoClick={scrolled ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : null}
      />

      <div className="article-page-inner">
        {/* ── Main left column ── */}
        <div className="article-main">
          <div className="article-header">
            <div className="card-tags article-tags">
              {frontmatter.subject && (
                <span className="tag tag--subject">{frontmatter.subject}</span>
              )}
              {concepts.map(kw => (
                <span key={kw} className="tag tag--keyword">{kw}</span>
              ))}
            </div>

            <h1 className="article-title">{frontmatter.title}</h1>

            {(() => {
              const authors = frontmatter.authors || []
              return showDetails ? (
                <ul className="author-list-expanded">
                  {authors.map((author, i) => (
                    <li key={author.id}>
                      {author.name}{author.corresponding ? '*' : ''}
                      <sup>{(author.affiliations || []).map(aid => {
                        const idx = (frontmatter.affiliations || []).findIndex(a => a.id === aid)
                        return idx + 1
                      }).join(',')}</sup>
                      {i < authors.length - 1 ? ',' : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="article-authors">
                  {authors.map((author, i) => (
                    <span key={author.id}>
                      {author.name}{author.corresponding ? '*' : ''}
                      {i < authors.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )
            })()}

            {showDetails && (
              <>
                {frontmatter.authors?.find(a => a.corresponding) && (
                  <p className="author-correspondence">
                    *For correspondence: {frontmatter.authors.find(a => a.corresponding)?.email}
                  </p>
                )}
                <ol className="institution-list">
                  {(frontmatter.affiliations || []).map(aff => (
                    <li key={aff.id}>{aff.name}{aff.country ? `, ${aff.country}` : ''}</li>
                  ))}
                </ol>
              </>
            )}

            <p className="article-doi">
              <a href={`https://doi.org/${versionConfig.doi || frontmatter.doi}`} target="_blank" rel="noopener noreferrer">
                https://doi.org/{versionConfig.doi || frontmatter.doi}
              </a>
            </p>

            <button className="show-more-details" onClick={() => setShowDetails(s => !s)}>
              {showDetails ? 'Show less' : 'Show more details'}
            </button>
          </div>

          {/* Assessment quote */}
          <div className="article-assessment-quote">
            <div className="assessment-quote-inner">
              <span className="assessment-quote-open">&ldquo;</span>
              <span
                className="assessment-quote-body"
                dangerouslySetInnerHTML={{ __html: wrapLastWord(ELIFE_ASSESSMENT.summary) }}
              />
            </div>
            <p className="article-editor-credit">
              <span className="article-editor-name">{ELIFE_ASSESSMENT.seniorEditor}</span>
              <span className="article-editor-institution">, {ELIFE_ASSESSMENT.seniorEditorInstitution}</span>
            </p>
          </div>

          {/* Section nav + body */}
          <div className="article-body">
            <nav className="section-nav">
              {navSections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={activeSection === s.id ? 'active' : ''}
                  onClick={e => {
                    e.preventDefault()
                    setActiveSection(s.id)
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >{s.label}</a>
              ))}
            </nav>

            <div className="article-content">
              {/* Abstract */}
              {abstractSection && (
                <section id="abstract">
                  <h2>Abstract</h2>
                  {(abstractSection.paragraphs || []).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </section>
              )}

              {/* Body sections */}
              {bodyArticleSections.map(section => (
                <StaticSection key={section.id} section={section} onFigureClick={openFigure} onRefClick={openReferenceByIndex} />
              ))}

              {/* References */}
              <section id="references">
                <h2>References</h2>
                <ol className="reference-list">
                  {STATIC_REFS.map((ref) => (
                    <li key={ref.key} className="reference-item">
                      <span dangerouslySetInnerHTML={{ __html: ref.html }} />
                      {ref.url && <> <a href={ref.url} target="_blank" rel="noreferrer" className="ref-doi">{ref.url}</a></>}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <aside className="article-sidebar">
          {versionConfig._v < 3 ? (
            <button
              className="sidebar-version-warning"
              onClick={() => setModal({ type: 'version' })}
            >
              <span className="sidebar-version-warning-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5 17V6H7V17H18V19H7C5.89543 19 5 18.1046 5 17Z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M1 21V10H3V21H14V23H3C1.89543 23 1 22.1046 1 21Z" fill="currentColor"/>
                  <path d="M21 2H11C10.4477 2 10 2.44772 10 3V13C10 13.5523 10.4477 14 11 14H21C21.5523 14 22 13.5523 22 13V3C22 2.44772 21.5523 2 21 2Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <span className="sidebar-version-warning-text">
                <span className="sidebar-version-warning-title">A newer version is available</span>
                <span className="sidebar-version-warning-row">
                  <strong className="sidebar-version-warning-version">{versionConfig.label}</strong>
                  <span className="sidebar-version-warning-dot">·</span>
                  <span className="sidebar-version-warning-date">{formatDate(versionConfig.date || frontmatter.date)}</span>
                </span>
              </span>
            </button>
          ) : (
            <button className="sidebar-card sidebar-card--btn" onClick={() => setModal({ type: 'version' })}>
              <div className="sidebar-version-row">
                <span className="sidebar-version">{versionConfig.label || 'Version 3'}</span>
                <span className="sidebar-version-dot">·</span>
                <span className="sidebar-date">{formatDate(versionConfig.date || frontmatter.date)}</span>
              </div>
              <p className="sidebar-version-status">{versionConfig.status || 'Declared as Version of Record'}</p>
            </button>
          )}
          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal({ type: 'peerreview' })}>
            <div className="sidebar-assessment">
              <div className="sidebar-assessment-line">
                <span className="card-term-dots">{'•'.repeat(SIG_DOTS[ELIFE_ASSESSMENT.significance])}</span>{' '}
                <strong>{ELIFE_ASSESSMENT.significance}</strong>
              </div>
              <div className="sidebar-assessment-line">
                <span className="card-term-dots">{'•'.repeat(STR_DOTS[ELIFE_ASSESSMENT.strength])}</span>{' '}
                <strong>{ELIFE_ASSESSMENT.strength}</strong>
              </div>
            </div>
          </button>

          <div className="sidebar-actions">
            <button className="sidebar-btn sidebar-btn--download"><DownloadIcon size={16} /> Download</button>
            <button className="sidebar-btn sidebar-btn--cite" onClick={() => setModal({ type: 'cite' })}><QuoteIcon size={20} /> Cite</button>
          </div>

          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal({ type: 'figures' })}>
            <div className="sidebar-figures">
              <div className="sidebar-figure-row"><FiguresIcon size={16} /> <span>5 Figures, 2 figure supplements</span></div>
            </div>
          </button>

          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal({ type: 'stats' })}>
            <div className="sidebar-stats">
              <div className="stat-col">
                <p><span className="stat-label">Views: </span><span className="stat-value">—</span></p>
                <p><span className="stat-label">Citations: </span><span className="stat-value">—</span></p>
              </div>
              <div className="stat-col">
                <p><span className="stat-label">Downloads: </span><span className="stat-value">—</span></p>
                <p><span className="stat-label">Mentions: </span><span className="stat-value">—</span></p>
              </div>
            </div>
          </button>
        </aside>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div
            className={(() => {
              if (modal.type === 'peerreview' || modal.type === 'figures') return 'modal modal--large'
              if (modal.type === 'figure' || modal.type === 'table') return 'modal modal--figure-viewer'
              if (modal.type === 'reference') return 'modal modal--reference'
              if (modal.type === 'version') return 'modal modal--version'
              return 'modal'
            })()}
            onClick={e => e.stopPropagation()}
          >
            {modal.type === 'peerreview' && (() => {
              const _v = versionConfig._v || 3
              const processText = _v === 1
                ? 'Public reviews were submitted in review of Version 1. Authors received additional private feedback from reviewers but have not yet submitted a revised version. They have provided a response to the reviews.'
                : _v === 2
                ? 'Public reviews were submitted in review of Version 1. Authors received additional private feedback from reviewers and have since published a revised version, along with a response to reviews included below. Reviews were updated slightly following submission of version 2 to acknowledge author revisions.'
                : 'Public reviews were submitted in review of Version 1. Authors received additional private feedback from reviewers and have since published a revised version, along with a response to reviews included below. Reviews were updated slightly following submission of version 2 to acknowledge author revisions. Authors have since published their final version of record (version 3).'
              const reviewerMeta = _v === 1
                ? 'Review of version 1  ·  Reviewer identity withheld'
                : 'Updated after version 2  ·  Reviewer identity withheld'
              const authorResponseMeta = _v === 1
                ? 'Submitted in response to peer reviews'
                : 'Submitted with version 2'
              return (
              <>
                <div className="modal-header modal-header--large">
                  <span className="modal-header-spacer" />
                  <span className="modal-header-title">Peer reviews</span>
                  <button className="modal-header-close" onClick={() => setModal(null)}>✕</button>
                </div>
                <div className="pr-scroll-area">
                <div className="pr-layout">
                  <nav className="pr-nav">
                    <ul className="pr-nav-list" style={{listStyle:'none',margin:0,padding:0}}>
                      {[
                        {id:'pr-assessment',label:'eLife Assessment'},
                        {id:'pr-process',label:'Peer review process'},
                        {id:'pr-reviewer-1',label:'Reviewer 1'},
                        {id:'pr-reviewer-2',label:'Reviewer 2'},
                        {id:'pr-author-response',label:'Author response'},
                      ].map((item,i) => (
                        <li key={item.id}>
                          <button
                            className={`pr-nav-item${i===0?' pr-nav-item--active':''}`}
                            onClick={() => document.getElementById(item.id)?.scrollIntoView({behavior:'smooth',block:'start'})}
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <div className="pr-content">

                    {/* eLife Assessment */}
                    <section className="pr-section" id="pr-assessment">
                      <h2 className="pr-h2">eLife Assessment</h2>
                      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                        <div className="pr-assessment-meta">
                          <span className="pr-assessment-meta-item">
                            <span className="pr-body">Significance:</span>
                            <strong className="pr-body">Important</strong>
                            <strong className="pr-body">•••</strong>
                          </span>
                          <span className="pr-assessment-meta-item">
                            <span className="pr-body">Strength of evidence:</span>
                            <strong className="pr-body">Convincing</strong>
                            <strong className="pr-body">•••</strong>
                          </span>
                        </div>
                        <p className="pr-assessment-quote">
                          {'"This is an '}
                          <strong>important</strong>
                          {' study providing '}
                          <strong>convincing</strong>
                          {' evidence that the insula and superior temporal sulcus play distinct roles in processing interpersonal guilt during social decisions. The task is elegantly designed and the multi-modal analyses are rigorous and well-executed."'}
                        </p>
                        <button className="pr-link">Read more about eLife assessments</button>
                      </div>
                      <div className="pr-editor-cards">
                        <div className="pr-editor-card">
                          <span className="pr-editor-role">Reviewing Editor</span>
                          <span className="pr-editor-name">{ELIFE_ASSESSMENT.reviewingEditor}</span>
                          <span className="pr-editor-institution">{ELIFE_ASSESSMENT.reviewingEditorInstitution}</span>
                        </div>
                        <div className="pr-editor-card">
                          <span className="pr-editor-role">Senior Editor</span>
                          <span className="pr-editor-name">{ELIFE_ASSESSMENT.seniorEditor}</span>
                          <span className="pr-editor-institution">{ELIFE_ASSESSMENT.seniorEditorInstitution}</span>
                        </div>
                      </div>
                    </section>

                    {/* Peer review process */}
                    <section className="pr-section" id="pr-process">
                      <h2 className="pr-h2">Peer review process</h2>
                      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                        <p className="pr-body">{processText}</p>
                        <button className="pr-link">Read more about eLife's peer review process</button>
                      </div>
                    </section>

                    {/* Reviewer 1 */}
                    <section className="pr-section" id="pr-reviewer-1">
                      <div className="pr-reviewer-header">
                        <h3 className="pr-h3">Reviewer 1</h3>
                        <p className="pr-reviewer-meta">{reviewerMeta}</p>
                      </div>
                      <div className="pr-reviewer-body">
                        <div className="pr-reviewer-text">
                          <p className="pr-body-heading">Summary:</p>
                          <p className="pr-body">The authors conducted a human neuroimaging study investigating the role of context in the representation of fear associations when the contingencies between a conditioned stimulus and shock unconditioned stimulus switches between contexts. The novelty of the analysis centered on neural pattern similarity to derive a measure of context and cue stability and generalization across different regions of the brain. Given the complexity and nuance of the results, it is kind of difficult to provide a concise summary. But during fear and reversal, there was cue generalization (between current CS+ cues) in the canonical fear network, and "item stability" for cues that changed their association with the shock in the IFG and precuneus. Reinstatement was quantified as pattern similarity for items or sets of cues from the earlier phases to the test phases, and they found different patterns in the IFG and dmPFC. A similar analytical strategy was applied to contexts.</p>
                          <p className="pr-body-heading">Strengths:</p>
                          <p className="pr-body">Overall, I found this to be a novel use of MVPA to study the role of context in reversal/extinction of human fear conditioning that yielded interesting results. The paper was overall well-written, with a strong introduction and fairly detailed methods and results. The lack of any univariate contrast results from the test phases was used as motivation for the neural pattern similarity approach, which I appreciated as a reader.</p>
                          {_v >= 2 && <p className="pr-body" style={{marginTop:'16px'}}>I have no additional or new comments. The authors adequately addressed my major comments and concerns.</p>}
                          {_v === 1 && (<>
                            <p className="pr-body-heading">Weaknesses:</p>
                            <p className="pr-body">This is quite a complicated protocol and analysis plan. The authors did a decent job explaining it, given the complexity of the approach and the dense results. But it did take reading it a couple of times to start to understand it. I'm not sure if there is a simpler way to describe the approach though. Just an observation. But perhaps there is a better way to explain the density of the different comparisons between the multiple cues and contexts. It can be difficult to totally avoid jargon in a complex scientific article, but the paper is very jargon-y.</p>
                            <p className="pr-body" style={{marginTop:'16px'}}>Here are a few more comments and stray observations, in no particular order of importance.</p>
                            <p className="pr-body" style={{marginTop:'16px'}}>(1) I had a difficult time unpacking lines 419-420: "item stability represents the similarity of the neural representation of an item to other representations of this same item."</p>
                            <p className="pr-body" style={{marginTop:'16px'}}>(2) The authors use the phrase "representational geometry" several times in the paper without clearly defining what they mean by this.</p>
                            <p className="pr-body" style={{marginTop:'16px'}}>(3) The abstract is quite dense and will likely be challenging to decipher for those without a specialized knowledge of both the topic (fear conditioning) and the analytical approach. For instance, the goal of the study is clearly articulated in the first few sentences, but then suddenly jumps to a sentence stating "our data show that contingency changes during reversal induce memory traces with distinct representational geometries characterized by stable activity patterns across repetitions..." this would be challenging for a reader to grok without having a clear understanding of the complex analytical approach used in the paper.</p>
                            <p className="pr-body" style={{marginTop:'16px'}}>(4) Minor: I believe it is STM200 not the STM2000.</p>
                            <p className="pr-body" style={{marginTop:'16px'}}>(5) Line 146: "...could be particularly fruitful as a means to study the influence of fear reversal or extinction on context representations, which have never been analyzed in previous fear and extinction learning studies." I direct the authors to Hennings et al., 2020, Contextual reinstatement promotes extinction generalization in healthy adults but not PTSD, as an example of using MVPA to decipher reinstatement of the extinction context during test.</p>
                            <p className="pr-body" style={{marginTop:'16px'}}>(6) This is a methodological/conceptual point, but it appears from Figure 1 that the shock occurs 2.5 seconds after the CS (and context) goes off the screen. This would seem to be more like a trace conditioning procedure than a standard delay fear conditioning procedure. This could be a trivial point, but there have been numerous studies over the last several decades comparing differences between these two forms of fear acquisition, both behaviorally and neurally, including differences in how trace vs delay conditioning is extinguished.</p>
                            <p className="pr-body" style={{marginTop:'16px'}}>(7) In Figure 4, it would help to see the individual data points derived from the model used to test significance between the different conditions (reinstatement between Acq, reversal, and test-new).</p>
                          </>)}
                        </div>
                        <p className="pr-doi">https://doi.org/10.7554/eLife.105126.3.sa1</p>
                      </div>
                    </section>

                    {/* Reviewer 2 */}
                    <section className="pr-section" id="pr-reviewer-2">
                      <div className="pr-reviewer-header">
                        <h3 className="pr-h3">Reviewer 2</h3>
                        <p className="pr-reviewer-meta">{reviewerMeta}</p>
                      </div>
                      <div className="pr-reviewer-body">
                        <div className="pr-reviewer-text">
                          <p className="pr-body-heading">Summary:</p>
                          <p className="pr-body">This is a timely and original study on the geometry of macroscopic (2.5 mm) brain representations of multiple cues and contexts in Pavlovian fear conditioning. The authors report that these representations differ between initial learning, and reversal learning, and remain stable during extinction.</p>
                          <p className="pr-body-heading">Strengths:</p>
                          <p className="pr-body">The authors address an important question and use a rigorous experimental methodology.</p>
                          <p className="pr-body-heading">Weaknesses:</p>
                          <p className="pr-body">The findings are limited by the chosen spatial resolution (2.5 mm) which is far away from what modern fMRI can achieve. Also, region-of-interesting findings should be considered exploratory due to the chosen FDR method for correction for multiple comparison (which is transparently reported).</p>
                        </div>
                        <p className="pr-doi">https://doi.org/10.7554/eLife.105126.3.sa2</p>
                      </div>
                    </section>

                    {/* Author response */}
                    <section className="pr-section" id="pr-author-response">
                      <div className="pr-reviewer-header">
                        <h3 className="pr-h3">Author response</h3>
                        <p className="pr-reviewer-meta">{authorResponseMeta}</p>
                      </div>
                      {_v === 1 ? (
                        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                          <p className="pr-body">We would like to sincerely thank the editors and reviewers for their thoughtful comments, which provide valuable insights, and will help us enhance the overall quality of our manuscript. We will address all comments comprehensively in our revised submission.</p>
                          <p className="pr-body">It appears to us that two major concerns were raised by the reviewers and highlighted by the editor, regarding statistical methodology and manuscript readability.</p>
                          <p className="pr-body">As a provisional response, we would like to summarize our approach for addressing them in our revised manuscript:</p>
                          <p className="pr-body">(1) Statistical Methodology</p>
                          <p className="pr-body">Two specific concerns were raised regarding the statistical methods:</p>
                          <p className="pr-body">First, regarding FDR versus FWE correction in our voxelwise (searchlight) analyses. We recognize that our methods section might have created some confusion on this point. While we stated that "all analyses are FDR-corrected unless noted otherwise", this was meant to refer only to ROI-based analyses. For all voxel-wise analyses, including searchlight RSA analyses, we actually employed FWE correction. This was briefly mentioned in the section on univariate analyses. However, we did not emphasize this information in the searchlight section of the methods, and it is to our understanding that this might have created some confusion.</p>
                          <p className="pr-body">To clarify: we used (1) FWE correction for all voxel-based analyses and (2) FDR correction for ROI-based analyses (which could thus be considered exploratory). However, to fully address the concerns raised by the reviewers, and avoid potential confusion for the future readers, we will use exclusively FWE correction methods in the revised version of the manuscript. If some category of ROI-based analysis only yields not-significant results when corrected with FWE, we plan to report the uncorrected p-values, and pinpoint the exploratory nature of these results.</p>
                          <p className="pr-body">Second, regarding the alpha threshold adjustment for searchlight analyses involving multiple comparisons within the same experimental phase: We acknowledge this concern and will address it thoroughly in our revision.</p>
                          <p className="pr-body">(2) Manuscript Readability</p>
                          <p className="pr-body">We agree that readability should be improved despite the paradigm's inherent complexity. In our revision, we will:</p>
                          <p className="pr-body">- Replace non-essential technical terminology with clearer descriptions</p>
                          <p className="pr-body">- Improve writing quality in particularly dense or conceptually complex sections</p>
                          <p className="pr-body">- Enhance the overall structure to better guide readers through our methods and findings</p>
                        </div>
                      ) : (
                        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                          <p className="pr-body">Thank you for this important point. We agree that our paradigm focuses more directly on reversal learning than on standard extinction, as the test phases represent extinction in the absence of a US but follow a reversal phase. To better reflect the core of our investigation, we have changed the title.</p>
                          <p className="pr-body">Proposed change in manuscript (Title): Original Title: Distinct representational properties of cues and contexts shape fear learning and extinction</p>
                          <p className="pr-body">New Title: Distinct representational properties of cues and contexts shape fear and reversal learning</p>
                        </div>
                      )}
                    </section>

                  </div>
                </div>
                </div>
              </>
              )
            })()}

            {modal.type === 'version' && (
              <>
                <div className="modal-header">
                  <span className="modal-header-title">Versions and timeline</span>
                  <button className="modal-header-close" onClick={() => setModal(null)}>✕</button>
                </div>
                <div className="modal-body-scroll">
                <div className="version-timeline">
                  {TIMELINE.map((entry, i) => {
                    const isCurrent = entry.version === (versionConfig._v || 3)
                    const isLatest = entry.version === 3 && (versionConfig._v || 3) < 3
                    const label = isCurrent ? entry.currentLabel : entry.label
                    return (
                      <div key={i} className="version-timeline-group">
                        {isCurrent ? (
                          <div className="version-timeline-card version-timeline-card--current">
                            <div className="version-timeline-title">{label}</div>
                            <div className="version-timeline-date">{entry.date}</div>
                            <div className="version-timeline-this">（This version）</div>
                          </div>
                        ) : entry.version !== null ? (
                          <div className="version-timeline-card version-timeline-card--link">
                            <div className="version-timeline-title">{label}</div>
                            <div className="version-timeline-date">{entry.date}</div>
                          </div>
                        ) : (
                          <div className="version-timeline-card version-timeline-card--link">
                            <div className="version-timeline-title">{label}</div>
                            <div className="version-timeline-date">{entry.date}</div>
                          </div>
                        )}
                        {entry.events.length > 0 && (
                          <div className="version-timeline-events">
                            {entry.events.map((ev, j) => (
                              <div key={j} className="version-timeline-event">
                                <div className="version-timeline-event-title">{ev.title}</div>
                                <div className="version-timeline-event-date">{ev.date}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                </div>
              </>
            )}

            {modal.type === 'cite' && (
              <>
                <div className="modal-header">
                  <span className="modal-header-title">Cite this article</span>
                  <button className="modal-header-close" onClick={() => setModal(null)}>✕</button>
                </div>
                <div className="modal-body-scroll">
                  <p className="modal-body">Placeholder for citation formats (APA, MLA, BibTeX, etc.) for this article.</p>
                </div>
              </>
            )}

            {modal.type === 'stats' && (
              <>
                <div className="modal-header">
                  <span className="modal-header-title">Article metrics</span>
                  <button className="modal-header-close" onClick={() => setModal(null)}>✕</button>
                </div>
                <div className="modal-body-scroll">
                  <p className="modal-body">Placeholder for detailed metrics about this article, including views, downloads, citations and mentions over time.</p>
                </div>
              </>
            )}

            {modal.type === 'figures' && (
              <FiguresModal
                figures={figures}
                tables={tables}
                references={references}
                initialScrollTop={modal.scrollTop}
                onSelectFigure={(fig, scrollTop) => setModal({ type: 'figure', data: fig, figuresScrollTop: scrollTop })}
                onSelectTable={(tbl, scrollTop) => setModal({ type: 'table', data: tbl, figuresScrollTop: scrollTop })}
                onClose={() => setModal(null)}
              />
            )}

            {modal.type === 'figure' && modal.data && (() => {
              const figType = getFigureType(modal.data.enumerator)
              const sharedProps = {
                figures,
                mdast,
                onAllFigures: () => setModal({ type: 'figures', scrollTop: modal.figuresScrollTop }),
                onNavigate: fig => setModal({ type: 'figure', data: fig, figuresScrollTop: modal.figuresScrollTop }),
                onClose: () => setModal(null),
                references,
              }
              if (figType === 'interactive') return (
                <InteractiveLightbox figure={modal.data} {...sharedProps} />
              )
              if (figType === 'ultra-hi-res') return (
                <ZoomableLightbox figure={modal.data} {...sharedProps} />
              )
              if (figType === 'video') return (
                <VideoLightbox figure={modal.data} {...sharedProps} />
              )
              return (
                <DefaultLightbox figure={modal.data} {...sharedProps} />
              )
            })()}

            {modal.type === 'table' && modal.data && (
              <TableLightbox
                table={modal.data}
                tables={tables}
                mdast={mdast}
                onAllFigures={() => setModal({ type: 'figures', scrollTop: modal.figuresScrollTop })}
                onNavigate={tbl => setModal({ type: 'table', data: tbl, figuresScrollTop: modal.figuresScrollTop })}
                onClose={() => setModal(null)}
                references={references}
              />
            )}

            {modal.type === 'reference' && modal.data && (
              <ReferenceLightbox
                data={modal.data}
                total={STATIC_REFS.length}
                onClose={() => setModal(null)}
                onAllRefs={() => setModal(null)}
                onPrev={() => openReferenceByIndex(modal.data.idx - 1)}
                onNext={() => openReferenceByIndex(modal.data.idx + 1)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Fake table mentions (one per table enumerator) ───────────
function fp(text) {
  return { type: 'paragraph', children: [{ type: 'text', value: text }] }
}
const FAKE_TABLE_MENTIONS = {
  1: [
    {
      section: 'Results',
      node: fp('Decoding accuracy in early visual cortex was significantly above chance (mean 76.3%, SD = 4.1; Table 1), consistent with robust stimulus-specific representations persisting across conditioning phases.'),
    },
    {
      section: 'Results',
      node: fp('Across participants, classification accuracy was highest in occipital regions (Table 1), with a reliable drop-off moving anteriorly into prefrontal cortex, suggesting a posterior-to-anterior gradient in CS specificity.'),
    },
    {
      section: 'Discussion',
      node: fp('The pattern of decoding accuracies reported in Table 1 closely mirrors findings from prior fear-learning paradigms, lending convergent validity to the multivariate approach adopted here.'),
    },
  ],
  2: [
    {
      section: 'Results',
      node: fp('The vmPFC cluster (Table 2; peak: x = 2, y = 44, z = −14, k = 312 voxels) showed preferential activation for CS+ stimuli during the reversal phase, consistent with a role in updating threat-contingency representations.'),
    },
    {
      section: 'Results',
      node: fp('Dorsal ACC activation (Table 2) was bilateral and centred on the border of BA24 and BA32, overlapping with regions previously implicated in CS generalisation gradients.'),
    },
    {
      section: 'Methods',
      node: fp('Peak voxel coordinates in MNI space for all reported clusters are provided in Table 2, alongside cluster-level p-values, effect size estimates (partial η²), and cluster extent in mm³.'),
    },
  ],
  3: [
    {
      section: 'Results',
      node: fp('Group-level summary statistics for SCR and valence ratings across all conditions and phases are presented in Table 3. Significant main effects of condition were observed for both measures (all p < 0.01).'),
    },
    {
      section: 'Discussion',
      node: fp('Our findings replicate prior reports of CS generalisation gradients in dACC (Table 3), extending this work by demonstrating condition-specific representational shifts that track behavioural contingency updating.'),
    },
  ],
}

// ── Shared figure viewer shell ───────────────────────────────
// Handles header, mentions toggle, and navigation for all figure types.
// The figure content (image area + caption) is passed as children.
function FigureViewerShell({
  figure, figures, mdast, onNavigate, onAllFigures, onClose, references, figType, children,
  titlePrefix = 'Figure', allLabel = 'All figures', showContentLabel = 'Show figure',
  overrideMentions,
}) {
  const [showMentions, setShowMentions] = useState(false)

  const currentIdx = figures ? figures.findIndex(f => f.label === figure.label) : -1
  const prev = currentIdx > 0 ? figures[currentIdx - 1] : null
  const next = figures && currentIdx < figures.length - 1 ? figures[currentIdx + 1] : null

  const figureHtmlId = figure.html_id || figure.identifier || figure.label
  const mentions = overrideMentions ?? (mdast ? extractMentions(mdast.children || [], figureHtmlId) : [])

  const typeLabel = figType === 'interactive' ? 'Interactive'
    : figType === 'ultra-hi-res' ? 'Ultra hi-res'
    : figType === 'video' ? 'Video'
    : null

  return (
    <div className="fv">
      <div className="fv-header">

        {/* Left: All figures + nav */}
        <div className="fv-header-left">
          <button className="fv-all-figures-btn" onClick={onAllFigures}>
            <OxaChevronLeftIcon size={20} /> {allLabel}
          </button>
          <div className="fv-nav-btns">
            <button className="fv-nav-btn" disabled={!prev} onClick={() => prev && onNavigate?.(prev)} title={`Previous ${titlePrefix.toLowerCase()}`}>
              <OxaArrowUpIcon size={18} />
            </button>
            <button className="fv-nav-btn" disabled={!next} onClick={() => next && onNavigate?.(next)} title={`Next ${titlePrefix.toLowerCase()}`}>
              <OxaArrowDownIcon size={18} />
            </button>
          </div>
        </div>

        {/* Centre: title only */}
        <div className="fv-header-center">
          <span className="fv-title">
            {titlePrefix} {figure.enumerator}
            {figures?.length ? <span className="fv-title-count"> (of {figures.length})</span> : null}
          </span>
        </div>

        {/* Right: Show mentions toggle + close */}
        <div className="fv-header-right">
          <button className="fv-mentions-btn" onClick={() => setShowMentions(m => !m)}>
            {showMentions ? showContentLabel : 'Show mentions'}
          </button>
          <button className="fv-close-btn" onClick={onClose} title="Close"><OxaCloseIcon size={20} /></button>
        </div>

        {/* Tag row: spans all 3 columns, badge centred */}
        {(showMentions || typeLabel) && (
          <div className="fv-header-tag-row">
            <span className={`fv-type-badge${showMentions ? ' fv-type-badge--mentions' : ''}`}>
              {showMentions ? 'Mentions' : typeLabel}
            </span>
          </div>
        )}

      </div>

      {showMentions
        ? <MentionsView mentions={mentions} figure={figure} references={references} titlePrefix={titlePrefix} />
        : children
      }
    </div>
  )
}

// ── Mentions view ─────────────────────────────────────────────
function MentionsView({ mentions, figure, references, titlePrefix = 'Figure' }) {
  if (!mentions.length) {
    return (
      <div className="fv-mentions-empty">
        No in-text mentions found for {titlePrefix} {figure.enumerator}.
      </div>
    )
  }

  // Group consecutive mentions under the same section heading
  const groups = []
  mentions.forEach((m, i) => {
    const last = groups[groups.length - 1]
    if (last && last.section === m.section) {
      last.items.push({ ...m, n: i + 1 })
    } else {
      groups.push({ section: m.section, items: [{ ...m, n: i + 1 }] })
    }
  })

  return (
    <div className="fv-mentions">
      <div className="fv-mentions-inner">
      {groups.map((g, gi) => (
        <div key={gi} className="fv-mentions-group">
          {g.section && <p className="fv-mentions-section">{g.section}</p>}
          {g.items.map(item => (
            <div key={item.n} className="fv-mentions-card">
              <span className="fv-mentions-num">{item.n}.</span>
              <div className="fv-mentions-text">
                <MdastRenderer nodes={[item.node]} references={references} />
              </div>
            </div>
          ))}
        </div>
      ))}
      </div>
    </div>
  )
}

// ── Default figure lightbox ──────────────────────────────────
function DefaultLightbox({ figure, figures, mdast, onNavigate, onAllFigures, onClose, references }) {
  const imageNode = figure.children?.find(c => c.type === 'image')
  const captionNode = figure.children?.find(c => c.type === 'caption')
  const src = imageNode?.url?.startsWith('/') ? `${IMAGE_BASE}${imageNode.url}` : imageNode?.url

  return (
    <FigureViewerShell
      figure={figure} figures={figures} mdast={mdast}
      onNavigate={onNavigate} onAllFigures={onAllFigures} onClose={onClose}
      references={references} figType="default"
    >
      <div className="fv-image-area" style={{ cursor: 'default' }}>
        {src && <img src={src} alt={imageNode?.alt || ''} className="fv-image" />}
      </div>
      {captionNode && (
        <div className="fv-caption">
          <MdastRenderer nodes={captionNode.children} references={references} />
        </div>
      )}
    </FigureViewerShell>
  )
}

// ── Interactive figure lightbox ──────────────────────────────
function InteractiveLightbox({ figure, figures, mdast, onNavigate, onAllFigures, onClose, references }) {
  const imageNode = figure.children?.find(c => c.type === 'image')
  const captionNode = figure.children?.find(c => c.type === 'caption')
  const defaultSrc = imageNode?.url?.startsWith('/') ? `${IMAGE_BASE}${imageNode.url}` : imageNode?.url
  const src = `${_BASE}assets/transit-2020.png` || defaultSrc

  const [condition, setCondition] = useState(INTERACTIVE_CONDITIONS[0].id)
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef(null)
  const imageAreaRef = useRef(null)

  const activeCondition = INTERACTIVE_CONDITIONS.find(c => c.id === condition)
  const imgFilter = activeCondition?.hue
    ? `hue-rotate(${activeCondition.hue}deg) saturate(0.85) brightness(1.05)`
    : 'none'

  function clampZoom(z) { return Math.min(Math.max(z, 1), 5) }

  function handleWheel(e) {
    e.preventDefault()
    setZoom(z => {
      const next = clampZoom(z - e.deltaY * 0.006)
      if (next === 1) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  // Attach wheel listener as non-passive so preventDefault() works
  useEffect(() => {
    const el = imageAreaRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset pan when zooming back to 1
  useEffect(() => { if (zoom <= 1) setOffset({ x: 0, y: 0 }) }, [zoom])

  function handleMouseDown(e) {
    if (zoom <= 1) return
    setDragging(true)
    dragOrigin.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  function handleMouseMove(e) {
    if (!dragging || !dragOrigin.current) return
    setOffset({ x: e.clientX - dragOrigin.current.x, y: e.clientY - dragOrigin.current.y })
  }

  function handleMouseUp() { setDragging(false) }

  function resetView() { setZoom(1); setOffset({ x: 0, y: 0 }) }

  return (
    <FigureViewerShell
      figure={figure} figures={figures} mdast={mdast}
      onNavigate={onNavigate} onAllFigures={onAllFigures} onClose={onClose}
      references={references} figType="interactive"
    >
      {/* ── Image area ── */}
      <div
        className="fv-image-area"
        ref={imageAreaRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
      >
        {/* Zoomable/pannable layer */}
        <div
          className="fv-image-transform"
          style={{ transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)` }}
        >
          {src && (
            <img
              src={src}
              alt={imageNode?.alt || ''}
              className="fv-image"
              style={{ filter: imgFilter, transition: 'filter 0.4s ease' }}
              draggable={false}
            />
          )}

          {/* Hotspot markers — scale with image */}
          {BRAIN_HOTSPOTS.map(h => (
            <button
              key={h.id}
              className={`fv-hotspot${activeHotspot === h.id ? ' fv-hotspot--active' : ''}`}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              onMouseEnter={() => setActiveHotspot(h.id)}
              onMouseLeave={() => setActiveHotspot(null)}
              onClick={() => setActiveHotspot(activeHotspot === h.id ? null : h.id)}
              aria-label={h.label}
            >
              <span className="fv-hotspot-dot" />
              {activeHotspot === h.id && (
                <div className={`fv-tooltip fv-tooltip--${h.x < 50 ? 'right' : 'left'}`}>
                  <strong>{h.label}</strong>
                  <span>{h.detail}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Condition panel — stays fixed in viewer, doesn't pan */}
        <div className="fv-condition-panel">
          <p className="fv-condition-panel-title">Condition</p>
          {INTERACTIVE_CONDITIONS.map(c => (
            <button
              key={c.id}
              className={`fv-condition-btn${condition === c.id ? ' active' : ''}`}
              onClick={() => setCondition(c.id)}
            >
              {c.shortLabel}
            </button>
          ))}
          {zoom > 1 && (
            <button className="fv-condition-btn fv-reset-btn" onClick={resetView}>
              Reset zoom
            </button>
          )}
        </div>
      </div>

      {/* ── Caption ── */}
      {captionNode && (
        <div className="fv-caption">
          <MdastRenderer nodes={captionNode.children} references={references} />
        </div>
      )}
    </FigureViewerShell>
  )
}

// ── Video figure lightbox ────────────────────────────────────
function VideoLightbox({ figure, figures, mdast, onNavigate, onAllFigures, onClose, references }) {
  const imageNode = figure.children?.find(c => c.type === 'image')
  const captionNode = figure.children?.find(c => c.type === 'caption')
  const defaultSrc = imageNode?.url?.startsWith('/') ? `${IMAGE_BASE}${imageNode.url}` : imageNode?.url
  const src = FIGURE_IMAGE_OVERRIDES[figure.enumerator] || defaultSrc

  return (
    <FigureViewerShell
      figure={figure} figures={figures} mdast={mdast}
      onNavigate={onNavigate} onAllFigures={onAllFigures} onClose={onClose}
      references={references} figType="video"
    >
      <div className="fv-image-area fv-image-area--video" style={{ cursor: 'default' }}>
        {src && <img src={src} alt={imageNode?.alt || ''} className="fv-image" />}
        <div className="fv-play-btn" aria-label="Play video">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M10 7L22 14L10 21V7Z" fill="currentColor" />
          </svg>
        </div>
      </div>
      {captionNode && (
        <div className="fv-caption">
          <MdastRenderer nodes={captionNode.children} references={references} />
        </div>
      )}
    </FigureViewerShell>
  )
}

// ── Ultra hi-res figure lightbox ─────────────────────────────
function ZoomableLightbox({ figure, figures, mdast, onNavigate, onAllFigures, onClose, references }) {
  const imageNode = figure.children?.find(c => c.type === 'image')
  const captionNode = figure.children?.find(c => c.type === 'caption')
  const defaultSrc = imageNode?.url?.startsWith('/') ? `${IMAGE_BASE}${imageNode.url}` : imageNode?.url
  const src = FIGURE_IMAGE_OVERRIDES[figure.enumerator] || defaultSrc

  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef(null)
  const imageAreaRef = useRef(null)

  function clampZoom(z) { return Math.min(Math.max(z, 1), 20) }

  function handleWheel(e) {
    e.preventDefault()
    setZoom(z => clampZoom(z - e.deltaY * 0.005))
  }

  function handleMouseDown(e) {
    if (zoom <= 1) return
    setDragging(true)
    dragOrigin.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  function handleMouseMove(e) {
    if (!dragging || !dragOrigin.current) return
    setOffset({ x: e.clientX - dragOrigin.current.x, y: e.clientY - dragOrigin.current.y })
  }

  function handleMouseUp() { setDragging(false) }

  function resetView() { setZoom(1); setOffset({ x: 0, y: 0 }) }

  // Non-passive wheel listener so preventDefault() works
  useEffect(() => {
    const el = imageAreaRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset pan when zooming back to 1
  useEffect(() => { if (zoom <= 1) setOffset({ x: 0, y: 0 }) }, [zoom])

  return (
    <FigureViewerShell
      figure={figure} figures={figures} mdast={mdast}
      onNavigate={onNavigate} onAllFigures={onAllFigures} onClose={onClose}
      references={references} figType="ultra-hi-res"
    >
      {/* ── Image area ── */}
      <div
        className="fv-image-area"
        ref={imageAreaRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
      >
        <div
          className="fv-image-transform"
          style={{ transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)` }}
        >
          {src && (
            <img src={src} alt={imageNode?.alt || ''} className="fv-image" draggable={false} />
          )}
        </div>
        {zoom > 1 && (
          <button className="fv-reset-zoom-btn" onClick={resetView}>Reset zoom</button>
        )}
      </div>

      {/* ── Caption ── */}
      {captionNode && (
        <div className="fv-caption">
          <MdastRenderer nodes={captionNode.children} references={references} />
        </div>
      )}
    </FigureViewerShell>
  )
}

// ── Table lightbox ──────────────────────────────────────────
function TableLightbox({ table, tables, mdast, onNavigate, onAllFigures, onClose, references }) {
  const tableNode = table.children?.find(c => c.type === 'table')
  const captionNode = table.children?.find(c => c.type === 'caption')
  const isNarrow = table.enumerator <= 2

  return (
    <FigureViewerShell
      figure={table}
      figures={tables}
      mdast={mdast}
      onNavigate={onNavigate}
      onAllFigures={onAllFigures}
      onClose={onClose}
      references={references}
      figType={null}
      titlePrefix="Table"
      allLabel="All figures"
      showContentLabel="Show table"
      overrideMentions={FAKE_TABLE_MENTIONS[table.enumerator] || []}
    >
      <div className="tv-content" style={isNarrow ? { maxWidth: '800px' } : undefined}>
        <div className="tv-table-scroll">
          {tableNode && <MdastRenderer nodes={[tableNode]} references={references} />}
        </div>
        {captionNode && (
          <div className="tv-caption">
            <MdastRenderer nodes={captionNode.children} references={references} />
          </div>
        )}
      </div>
    </FigureViewerShell>
  )
}

// ── Figures and data modal ───────────────────────────────────
const FD_SUPP_FILES = [
  { label: 'Supplementary file 1', desc: 'Demographic information and behavioral data summary', size: '48 KB' },
  { label: 'Supplementary file 2', desc: 'Full statistical model outputs and parameter estimates', size: '132 KB' },
  { label: 'Source data 1', desc: 'Raw fMRI signal data for CS+ and CS− conditions', size: '2.4 MB' },
]

const FD_SECTIONS = [
  { id: 'figures', label: 'Figures' },
  { id: 'data', label: 'Data' },
  { id: 'supplementary', label: 'Supplementary files' },
  { id: 'data-availability', label: 'Data availability' },
]

function FiguresModal({ figures, tables, references, onSelectFigure, onSelectTable, onClose, initialScrollTop }) {
  const [activeSection, setActiveSection] = useState('figures')
  const contentRef = useRef(null)

  useEffect(() => {
    if (initialScrollTop && contentRef.current) {
      contentRef.current.scrollTop = initialScrollTop
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function scrollToSection(id) {
    const container = contentRef.current
    const el = document.getElementById(`fds-${id}`)
    if (el && container) {
      const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 8
      container.scrollTo({ top, behavior: 'smooth' })
    }
    setActiveSection(id)
  }

  function handleScroll() {
    const container = contentRef.current
    if (!container) return
    const containerTop = container.getBoundingClientRect().top
    for (const s of [...FD_SECTIONS].reverse()) {
      const el = document.getElementById(`fds-${s.id}`)
      if (el && el.getBoundingClientRect().top - containerTop <= 80) {
        setActiveSection(s.id)
        return
      }
    }
    setActiveSection('figures')
  }

  return (
    <div className="fd-modal">
      {/* Header */}
      <div className="fd-header">
        <div className="fd-header-side" />
        <h2 className="fd-title">Figures and data</h2>
        <div className="fd-header-side fd-header-side--right">
          <button className="fv-mentions-btn">Download all</button>
          <button className="fv-close-btn" onClick={onClose} title="Close"><OxaCloseIcon size={20} /></button>
        </div>
      </div>

      {/* Body */}
      <div className="fd-scroll-area" ref={contentRef} onScroll={handleScroll}>
        <div className="fd-body">
        {/* Jump nav */}
        <nav className="fd-nav">
          {FD_SECTIONS.map(s => (
            <button
              key={s.id}
              className={`fd-nav-item${activeSection === s.id ? ' active' : ''}`}
              onClick={() => scrollToSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="fd-content">
        <div className="fd-content-inner">

          {/* ── Figures ── */}
          <section id="fds-figures" className="fd-section">
            <h2 className="fd-section-heading">Figures</h2>
            <MdastRenderer
              nodes={figures}
              references={references}
              onFigureClick={htmlId => {
                const fig = figures.find(f => (f.html_id || f.label) === htmlId) || figures[0]
                onSelectFigure(fig, contentRef.current?.scrollTop ?? 0)
              }}
            />
          </section>

          {/* ── Data (tables) ── */}
          <section id="fds-data" className="fd-section">
            <h2 className="fd-section-heading">Data</h2>
            <MdastRenderer
              nodes={tables}
              references={references}
              onTableClick={htmlId => {
                const tbl = tables.find(t => (t.html_id || t.label) === htmlId) || tables[0]
                onSelectTable(tbl, contentRef.current?.scrollTop ?? 0)
              }}
            />
          </section>

          {/* ── Supplementary files ── */}
          <section id="fds-supplementary" className="fd-section">
            <h2 className="fd-section-heading">Supplementary files</h2>
            <div className="modal-data-list">
              {FD_SUPP_FILES.map(s => (
                <div key={s.label} className="modal-data-item">
                  <div className="modal-data-item-info">
                    <span className="modal-data-item-label">{s.label}</span>
                    <span className="modal-data-item-desc">{s.desc}</span>
                    <span className="modal-data-item-meta">{s.size}</span>
                  </div>
                  <button className="modal-data-item-btn">Download</button>
                </div>
              ))}
            </div>
          </section>

          {/* ── Data availability ── */}
          <section id="fds-data-availability" className="fd-section">
            <h2 className="fd-section-heading">Data availability statement</h2>
            <p className="fd-data-avail-text">
              The data that support the findings of this study are available from the corresponding
              author on reasonable request. Raw fMRI data and analysis scripts are deposited at
              OpenNeuro (accession number ds004876, doi: 10.18112/openneuro.ds004876.v1.0.0).
              Statistical parametric maps are available at NeuroVault (collection ID: 16423).
            </p>
          </section>

        </div>
        </div>
        </div>
      </div>
    </div>
  )
}


// ── Fake article preview content (reused across all references) ──
const FAKE_ARTICLE_PREVIEW = {
  abstract: 'This study investigated the neural mechanisms involved in feelings of interpersonal guilt and responsibility evoked by social decisions. Participants repeatedly chose between safe and risky monetary outcomes in social contexts, with outcomes affecting both themselves and a partner. Happiness decreases following low outcomes for the partner were larger when the participant rather than their partner had made the choice, fitting an operational definition of guilt. This guilt effect was associated with BOLD signal increase in the left anterior insula, and connectivity between this region and the right inferior frontal gyrus varied depending on choice and condition.',
  introduction: 'Guilt is a negative emotional response to harming someone with whom one has a positive social bond. It influences decisions and abnormal sensitivity to guilt is associated with severe social dysfunctions. Several brain regions have been associated with guilt, including the anterior insula, dorsal cingulate cortex, temporo-parietal junction, and ventromedial prefrontal cortex. We investigated the neural mechanisms of guilt evoked during social choices that expose others to uncertain outcomes.',
}

// ── Reference lightbox ───────────────────────────────────────
function ReferenceLightbox({ data, total, onClose, onAllRefs, onPrev, onNext }) {
  const idx = data.idx ?? 0
  const hasPrev = idx > 0
  const hasNext = idx < total - 1

  // Extract title: plain text between "(year). " and ". <i>" (journal in italics)
  const titleMatch = (data.html || '').match(/\)\.\s+(.+?)\.\s+<i>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''

  const doi = data.url || ''
  const pubmedUrl = doi
    ? `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(doi)}`
    : 'https://pubmed.ncbi.nlm.nih.gov/'
  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(title || doi)}`

  function copyCitation() {
    const text = (data.html || '').replace(/<[^>]+>/g, '')
    navigator.clipboard?.writeText(text)
  }

  return (
    <div className="ref-modal">
      {/* Header */}
      <div className="ref-modal-header">
        <div className="ref-modal-header-left">
          <button className="fv-all-figures-btn" onClick={onAllRefs}>
            <OxaChevronLeftIcon size={14} /> All references
          </button>
          <div className="fv-nav-btns">
            <button className="fv-nav-btn" onClick={onPrev} disabled={!hasPrev} aria-label="Previous reference">
              <OxaArrowUpIcon size={16} />
            </button>
            <button className="fv-nav-btn" onClick={onNext} disabled={!hasNext} aria-label="Next reference">
              <OxaArrowDownIcon size={16} />
            </button>
          </div>
        </div>
        <div className="ref-modal-header-center">
          Reference {idx + 1}
        </div>
        <div className="ref-modal-header-right">
          <button className="fv-mentions-btn">Show mentions</button>
          <button className="fv-close-btn" onClick={onClose}><OxaCloseIcon size={16} /></button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="ref-modal-scroll">
        <div className="ref-modal-inner">

          {/* Citation */}
          <div className="ref-modal-section">
            <h3 className="ref-modal-section-title">Citation</h3>
            <div className="ref-modal-citation-card">
              <div className="modal-reference-citation" dangerouslySetInnerHTML={{ __html: data.html }} />
              {doi && <div className="ref-modal-doi">{doi}</div>}
            </div>
            <div className="ref-modal-actions">
              <a href={pubmedUrl} target="_blank" rel="noreferrer" className="ref-modal-action-btn">PubMed</a>
              <a href={scholarUrl} target="_blank" rel="noreferrer" className="ref-modal-action-btn">Google Scholar</a>
              <button className="ref-modal-action-btn" onClick={copyCitation}>Copy citation</button>
            </div>
          </div>

          {/* Article preview */}
          <div className="ref-modal-section">
            <h3 className="ref-modal-section-title">Article preview</h3>
            <div className="ref-modal-preview-card">
              <h2 className="ref-modal-preview-title">{title || 'Referenced article'}</h2>
              <div className="ref-modal-preview-section">
                <h4 className="ref-modal-preview-section-heading">Abstract</h4>
                <p className="ref-modal-preview-text">{FAKE_ARTICLE_PREVIEW.abstract}</p>
              </div>
              <div className="ref-modal-preview-section">
                <h4 className="ref-modal-preview-section-heading">Introduction</h4>
                <p className="ref-modal-preview-text">{FAKE_ARTICLE_PREVIEW.introduction}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
