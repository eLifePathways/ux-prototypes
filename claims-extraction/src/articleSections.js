// Article content for eLife 105391
// Gädeke et al. — Contributions of insula and superior temporal sulcus to
// interpersonal guilt and responsibility in social decisions (2026)
// Source: https://elifesciences.org/articles/105391

export const articleMeta = {
  doi: '10.7554/eLife.105391.3',
  title: 'Contributions of insula and superior temporal sulcus to interpersonal guilt and responsibility in social decisions',
  authors: ['Maria Gädeke', 'Tom Eric Willems', 'Omar Salah Ahmed', 'Bernd Weber', 'René Hurlemann', 'Johannes Schultz'],
  published: 'March 24, 2026',
  journal: 'eLife',
  volume: '15',
};

export const articleFigures = [
  {
    id: 'fig1',
    label: 'Figure 1',
    title: 'Experimental design',
    url: 'https://iiif.elifesciences.org/lax:105391%2Felife-105391-fig1-v1.tif/full/617,/0/default.jpg',
    caption: 'In every trial, participants were presented with pairs of monetary options (a safe and a risky option; the risky option was a lottery with equally probable high and low outcomes). Three conditions were tested: Solo (participant\'s choice affects only themselves), Social (participant chooses for both), and Partner (partner\'s algorithm chooses for both). Critically, selecting the risky option in social conditions resulted in lotteries played independently for each player.',
  },
  {
    id: 'fig2',
    label: 'Figure 2',
    title: 'Participant choices in Studies 1 and 2',
    url: 'https://iiif.elifesciences.org/lax:105391%2Felife-105391-fig2-v1.tif/full/617,/0/default.jpg',
    caption: 'The probability of choosing the risky option (lottery) in both Solo and Social conditions is well explained by the difference in expected value (A, D). Risk premiums showed no significant differences between conditions (B, E). Expected utility theory parameter estimates revealed slightly higher risk aversion in social versus solo decisions in Study 1 only (C, F).',
  },
  {
    id: 'fig3',
    label: 'Figure 3',
    title: 'Participant momentary happiness in Studies 1 and 2',
    url: 'https://iiif.elifesciences.org/lax:105391%2Felife-105391-fig3-v1.tif/full/617,/0/default.jpg',
    caption: 'Happiness correlated with rewards for both participant (A, E) and partner (B, F). The Responsibility Redux computational model predicted happiness variations well (C, G). Critically, changes in momentary happiness after lottery choices in Social and Partner conditions varied with lottery outcome and decision-maker, with lower outcomes decreasing happiness more when participants chose (D, H).',
  },
  {
    id: 'fig3s1',
    label: 'Figure 3—figure supplement 1',
    title: 'Parameter recovery',
    url: 'https://iiif.elifesciences.org/lax:105391%2Felife-105391-fig3-figsupp1-v1.tif/full/617,/0/default.jpg',
    caption: 'Parameter recovery validates the stability of computational model parameters, confirming reliability of estimated weights across the happiness data models.',
  },
  {
    id: 'fig4',
    label: 'Figure 4',
    title: 'BOLD responses',
    url: 'https://iiif.elifesciences.org/lax:105391%2Felife-105391-fig4-v1.tif/full/617,/0/default.jpg',
    caption: 'Regions active during risky choices (A), social decision-making (B), with TPJ and precuneus most active during participant\'s risky social choices (C). Anterior insula responded to low partner outcomes from participant choices (D–F). Ventral striatum tracked participant rewards (G), while left STS tracked partner prediction errors from participant decisions (H–I).',
  },
  {
    id: 'fig5',
    label: 'Figure 5',
    title: 'Functional connectivity changes',
    url: 'https://iiif.elifesciences.org/lax:105391%2Felife-105391-fig5-v1.tif/full/617,/0/default.jpg',
    caption: 'Connectivity between the left anterior insula (seed) and a cluster in the right inferior frontal gyrus varied based on condition and choice type, being highest during risky solo choices and safe social choices. This suggests information flow about guilt-related processing during social decision-making.',
  },
  {
    id: 'fig5s1',
    label: 'Figure 5—figure supplement 1',
    title: 'STS connectivity patterns',
    url: 'https://iiif.elifesciences.org/lax:105391%2Felife-105391-fig5-figsupp1-v1.tif/full/617,/0/default.jpg',
    caption: 'Left STS showed opposite connectivity patterns with left IFG, with strongest connectivity during safe solo choices and risky social choices, complementing insula-IFG findings.',
  },
];

export const articleSections = [
  {
    id: 'abstract',
    label: 'Abstract',
    depth: 1,
    paragraphs: [
      'This study investigated the neural mechanisms involved in feelings of interpersonal guilt and responsibility evoked by social decisions in humans. In two studies (one during fMRI), participants repeatedly chose between safe and risky monetary outcomes in social contexts. Across conditions, each participant chose for both themselves and a partner (Social condition), or the partner chose for both themselves and the participant (Partner condition), or the participant chose just for themselves (Solo condition, control). If the risky option was chosen in the Social or Partner condition, participant and partner could each receive either the high or the low outcome of a lottery with 50% probability, independently of each other. Participants were shown the outcomes for themselves and for their partner on each trial and reported their momentary happiness every few trials. As expected, participant happiness decreased following both low lottery outcomes for themselves and for the partner. Crucially, happiness decreases following low outcomes for the partner were larger when the participant rather than their partner had made the choice, which fits an operational definition of guilt. This guilt effect was associated with BOLD signal increase in the left anterior insula. Connectivity between this region and the right inferior frontal gyrus varied depending on choice and experimental condition, suggesting that this part of prefrontal cortex is sensitive to guilt-related information during social choices. Variations in happiness were well explained by computational models based on participants\' and partners\' rewards and reward prediction errors. A model-based analysis revealed a left superior temporal sulcus cluster that tracked partner reward prediction errors that followed participant choices. Our findings identify neural mechanisms of guilt and social responsibility during social decisions under risk.',
    ],
  },
  {
    id: 'introduction',
    label: 'Introduction',
    depth: 1,
    paragraphs: [
      'Imagine that you go out to dinner with a friend and it is your turn to choose the restaurant. You can choose between two restaurants: one that you both know well, with very predictable food of good quality, and a new restaurant that neither you nor your friend has eaten in before. You decide to try the new one. Unfortunately, while your dish is nice, your friend\'s turns out to be worse than the known restaurant\'s dishes. How would you feel? Would you feel differently if it had been your friend\'s turn to choose the restaurant? Being responsible for such suboptimal outcomes for others can induce a feeling of interpersonal guilt, formally described as a negative emotional response to harming someone with whom one has a positive social bond (Baumeister, 1998; Baumeister et al., 1994; Berndsen et al., 2004; Tangney et al., 2007; Zeelenberg and Breugelmans, 2008). Guilt influences decisions (e.g., Charness and Dufwenberg, 2006), and abnormal sensitivity to guilt is associated with severe social dysfunctions ranging from psychopathy to depression and anxiety, depending on whether sensitivity to guilt is, respectively, reduced or increased (Tangney et al., 2007).',
      'Several brain regions have been associated with the feeling of guilt: the anterior insula (aIns) (Bastin et al., 2016; Lamm and Singer, 2010; Piretti et al., 2023), the dorsal cingulate cortex (Bastin et al., 2016; Gifuni et al., 2017) and the left temporo-parietal junction (Bastin et al., 2016; Piretti et al., 2023), the ventromedial prefrontal cortex (Krajbich et al., 2009), and with various other regions and networks involved depending on the method used to induce guilt (Bastin et al., 2016; Gifuni et al., 2017). However, we are interested in the mechanisms involved in a specific, as yet understudied aspect of guilt: the kind that can result from everyday choices that expose others to an uncertain outcome. To study this, we built on findings from experimental social decision-making tasks.',
      'Several studies have used games from behavioural economics or perceptual tasks linked to punishment of a partner. For example, participants behaving in accord with an economic definition of guilt aversion during a trust game showed activation in insula, supplementary motor area, dorsolateral prefrontal cortex (dlPFC) and temporal parietal junction (Chang et al., 2011). In another study, partners received painful stimuli when participants made errors during a difficult perception task. These errors evoked activations in the left aIns and dlPFC in the participants (Koban et al., 2013). In a variation of this task, participants could decide to bear a proportion of their partner\'s pain (Yu et al., 2014). The level of pain taken, indicative of guilt, and activations in anterior middle cingulate cortex and aIns were higher when the pain followed errors made only by the participant rather than by both players. A multivariate reanalysis of these two datasets revealed a neural signature for guilt (Yu et al., 2020), with key regions including the anterior medial cingulate cortex, insula, inferior frontal gyrus (IFG), inferior temporal cortex, thalamus, and cerebellum.',
      'One recent study paired the aforementioned perception-and-pain paradigm with dictator game decisions that allowed the participant to compensate for the partner\'s outcome (Gao et al., 2018). The guilt context increased advantageous-inequity aversion and decreased disadvantageous-inequity aversion and affected the neural correlates of these inequities (respectively, mentalizing-related and emotion- and conflict-related regions). Finally, another study contrasted guilt and shame: confederates either experienced economic loss due to bad participant advice (participants experienced guilt), or experienced no loss when participants\' bad advice was correctly refused by the confederate (participants experienced shame) (Zhu et al., 2019). Guilt relative to shame activated supramarginal gyrus and temporo-parietal junction as well as orbitofrontal cortex, ventrolateral, and dorsolateral prefrontal cortex. Multivariate analyses revealed that guilt could be distinguished from shame based on activation in ventral anterior cingulate cortex and dorsomedial prefrontal cortex.',
      'One landmark study reported on the mechanisms involved in seeking or avoiding responsibility in decisions affecting a group of individuals, and reported involvement of medial prefrontal cortex, aIns and temporo-parietal junction (Edelson et al., 2018). In this elegant study, participants could delegate their choice between a risky and a safe option to a group or decide themselves; in separate conditions, the choice affected payoff either only for the participant or for all group members. Interestingly, most participants displayed responsibility aversion, and this effect could not be explained by guilt, suggesting people associate a psychological cost with assuming responsibility for others\' outcomes. However, in many situations, one does not have the possibility to delegate a decision to others, and choosing a risky option in such a case may evoke guilt when the outcome for others is negative. The neural mechanisms underlying guilt evoked during such situations of social responsibility are still unknown. These questions are the subject of the present study. Similarly to Edelson et al.\'s and more recent studies (Arioli et al., 2023; Fareri et al., 2022), our paradigm leveraged a risky choice task with social conditions.',
      'In our experiment, participants were paired with a partner and played an \'ice-breaker\' game that created a positive social bond between them, increasing the likelihood of feeling empathy and guilt for each other (Baumeister, 1998; Julle-Danière et al., 2020; Loewenstein et al., 1989). Participants or their partner then chose between risky and safe monetary options in three conditions (Figure 1). In the Social condition, the outcome of choices affected both participant and partner; participants were and felt responsible for these outcomes because they had agency over their decisions and knew that they could have chosen otherwise (Frith, 2014). We contrasted this condition with similar choices made by a simple expected-value-maximizing algorithm posing for the partner (Partner condition), and participant choices only affecting the participant themselves (Solo condition, acting as control). Importantly, we assessed the emotional impact of the outcomes of these choices by monitoring participants\' happiness every two trials (Rutledge et al., 2014; Rutledge et al., 2016). This allowed us to fit computational models to happiness data and search for networks sensitive to reward prediction errors resulting from participant or partner choices. We ran two experiments, Study 1 outside the MRI scanner and Study 2 during fMRI, with separate groups of participants.',
      'We analysed our behavioural data using several complementary methods: choices were modelled with mixed-effects regressions serving as manipulation checks; risk preferences expressed in choices were assessed using a comprehensive expected utility model as well as with a simpler, more robust \'risk premium\' approach; and happiness data were fitted, in addition to the computational models, with several linear mixed models (LMMs) to assess the impact of both the participant\'s and their partner\'s rewards, the impact of agency and their interactions. Inspired by findings reported in previous neuroimaging of social emotions, we also used several methods to analyse our fMRI data, including conventional methods (both region-of-interest and mass univariate); mixed-effects regression models; computational model-based analyses (inspired by, e.g., Konovalov et al., 2021a; Rutledge et al., 2014); and functional connectivity (e.g., Edelson et al., 2018; Konovalov et al., 2021a). The behavioural modelling is thus complemented by neuroimaging analyses that offer insight about both the activity in regions associated with guilt as well as their place in a wider network, providing an in-depth comprehensive analysis of the mechanisms behind guilt evoked by social responsibility.',
    ],
  },
  {
    id: 'results',
    label: 'Results',
    depth: 1,
    paragraphs: [],
    children: [
      {
        id: 'results-behaviour',
        label: 'Behaviour',
        depth: 2,
        paragraphs: [],
        children: [
          {
            id: 'results-behaviour-overview',
            label: 'Overview',
            depth: 3,
            paragraphs: [
              'We first verified that participants\' choices were reasonable in the Solo and Social conditions, then assessed whether these choices and the risk preferences they revealed changed depending on whether participants chose just for themselves (solo) or for themselves and the interaction partner (social). Next, we assessed whether momentary happiness varied with decision outcomes and whether responsibility influenced this relationship. Lastly, we fitted computational models to the happiness data. While Study 1 (behaviour only) was run before Study 2 (fMRI), we will report the results of both studies together as their results were highly consistent.',
            ],
          },
          {
            id: 'results-choices-manipulation',
            label: 'Choices: manipulation check',
            depth: 3,
            paragraphs: [
              'As expected, participants\' probability of choosing the risky option (lottery) increased with the difference between the expected value of the lottery and the value of the safe option (Study 1: Figure 2A, t(4796) = 9.26, p < 3.1e–20, β = 0.074, 95% CI = [0.059 0.090]; Study 2: Figure 2D, t(3829) = 10.62, p < 5.3e–26, β = 0.093, 95% CI = [0.075 0.110]; mixed-effects regressions, see Equation 1, detailed results are reported in Appendix 1—table 1). Participants chose the lottery more often in the Solo condition than in the Social condition in Study 1 (t(4796) = 2.54, p = 0.011, β = 0.164, 95% CI = [0.038 0.291]), but this difference was not found in Study 2 (t(3829) = 0.23, p = 0.82, β = 0.015, 95% CI = [–0.109 0.138]). There was no significant interaction between the difference in expected values and experimental conditions in either study (p > 0.52).',
            ],
          },
          {
            id: 'results-choices-risk',
            label: 'Choices: risk preferences',
            depth: 3,
            paragraphs: [
              'To better assess whether people\'s risk preferences varied between the Solo and the Social condition, we evaluated two additional measures. First, we calculated for each participant a \'risk premium\', defined as the difference between the expected value of a lottery and its certainty equivalent (see Equation 2 in Methods; positive risk premiums indicate risk aversion). Second, we used an expected utility theory (EUT) approach to calculate a parameter ρ that describes a decision-maker\'s risk attitude under the assumption of constant absolute risk aversion (see Equation 3 in Methods). We used two measures because fitting the EUT model, the more comprehensive measure that takes into account all choices of a participant, requires many trials to be fitted reliably, a condition that was not satisfied in many participants of both studies; in contrast, the risk premium\'s single-point measure of risk aversion could be estimated in all participants. Risk premiums did not differ between Social and Solo conditions (Study 1: Figure 2B, t(39) = 1.53, p = 0.134, Cohen\'s d = 0.24, BF10 = 0.49; Study 2: Figure 2E, t(43) = –0.21, p = 0.84, d = –0.03, BF10 = 0.17).',
              'In sum, participants showed very similar risk preferences when making decisions affecting only themselves (Solo condition) or themselves and their partner (Social condition), with a tendency towards higher risk aversion in the Social condition in Study 1.',
            ],
          },
          {
            id: 'results-happiness-reward',
            label: 'Momentary happiness: links to reward',
            depth: 3,
            paragraphs: [
              'Momentary happiness was assessed every two trials in a similar manner to previous studies by Rutledge et al., 2014; Rutledge et al., 2016. Across all trials, in both studies, participant momentary happiness correlated with rewards obtained in the current trial by the participant and by the partner (Correlations with participant reward, Study 1: F(1,3598) = 691.5, p < 0.001, R2 = 0.16; partner reward, Study 1: F(1,2426) = 128.6, p < 0.001, R2 = 0.05; participant reward, Study 2: F(1,2630) = 650.8, p < 0.001, R2 = 0.20; partner reward, Study 2: F(1,1735) = 111.8, p < 0.001, R2 = 0.06; Figure 3A, B, E, F). Based on previous findings (Rutledge et al., 2016), we reasoned that participants\' momentary happiness would be influenced not only by rewards obtained in the current trial, but also by expected rewards, reward prediction errors, rewards received in previous trials, and differences between rewards obtained by the participant and the partner. Crucial for our research question, we aimed to assess whether responsibility for these rewards, that is, taking into account whether the rewards occurred following choices made by the participant or the partner, would also influence variations in happiness.',
              'All models explained variations in happiness reasonably well (Table 1). Overall, the Responsibility and Responsibility Redux (Figure 3C, G) models explained the data best (highest R²/adjusted R² or lowest AIC/BIC). Crucially, we find here that the partner\'s reward prediction errors (social_pRPE and partner_pRPE) contributed to explaining changes in participants\' momentary happiness. In particular, the partner\'s reward prediction errors resulting from the participants\' decisions (social_pRPE), that is, those pRPE for which participants were responsible, contributed to explaining our data.',
            ],
          },
          {
            id: 'results-happiness-guilt',
            label: 'Momentary happiness: effects of agency, responsibility, and guilt',
            depth: 3,
            paragraphs: [
              'Next, we assessed whether happiness varied depending on the participant\'s agency (Social + Solo vs. Partner), and found happiness to be lower when the participant chose, independent of the outcome (Study 1: t(3600) = –3.92, p < 0.0001, β = –0.14, 95% CI = [−0.20 to 0.07]; Study 2: t(2870) = –6.07, p < 0.0001, β = –0.24, 95% CI = [−0.31 to 0.16]). This is interesting in itself and may reflect the drive behind responsibility aversion reported by Edelson et al.\'s 2018 study: being assigned the role of the decider in a social setting may make people slightly unhappy, perhaps due to \'weight of the responsibility\'. To specifically search for a sign of interpersonal guilt, we analysed happiness values reported after outcomes of lottery choices in the Social and Partner conditions using conventional LMMs (Equation 10). Crucially, the interaction between partner outcome and decision-maker was significant (Study 1: t(1180) = 3.52, p = 0.0004, β = 0.37, 95% CI = [0.16 0.58]; Study 2: t(937) = 2.85, p = 0.0045, β = 0.33, 95% CI = [0.10 0.56]).',
              'When the partner received the low lottery outcome, participant happiness was lower when they rather than the partner had chosen the lottery (Figure 3D, H). When the partner received the low lottery outcome of a participant-chosen lottery, they would presumably feel let down because the participant could have chosen the better safe option. As participants knew this, they were likely to feel \'simple guilt\' (Battigalli and Dufwenberg, 2007). This behavioural effect (difference in happiness obtained when the partner received low lottery outcomes after participant rather than partner choices) is thus compatible with \'simple guilt\', and we will thus refer to it as \'guilt effect\'.',
              'In sum, in both studies, we found evidence that participants\' happiness was influenced by the outcomes of choices for their partner, especially by outcomes resulting from participant decisions, that is, partner outcomes for which participants were responsible. Within these outcomes, participants felt worse following low lottery outcomes for the partner if those outcomes were consequences of their own choice rather than the partner\'s, which we interpret as interpersonal guilt.',
            ],
          },
        ],
      },
      {
        id: 'results-bold',
        label: 'BOLD signal',
        depth: 2,
        paragraphs: [
          'Next, we sought to uncover the neural mechanisms associated with our guilt effect and those involved in tracking consequences of participants\' decisions on their partner. We analysed the BOLD responses of brain regions engaged during decision-making and at the time of receiving the outcomes of the choice using conventional as well as computational model-based analyses, using the fMRI data collected in Study 2.',
        ],
        children: [
          {
            id: 'results-bold-decision',
            label: 'Brain regions engaged during social decision-making',
            depth: 3,
            paragraphs: [
              'Given that our task involved several conditions and successive trial components, we aimed to first replicate previous results related to the neural correlates of decisions under economic risk. We searched for brain regions engaged more when participants chose the risky instead of the safe option and found such responses in the bilateral ventral striatum (Cohen\'s d = 0.72 and 0.85 in the left and right clusters, respectively; Figure 4A and Appendix 1—table 3), which replicates previous findings (Cui et al., 2022; Preuschoff et al., 2006). Next, we aimed to identify the brain regions associated with social decision-making under risk and searched for regions more engaged during decisions in the Social condition compared to the Solo condition. Three significant clusters of voxels were identified (Figure 4B and Appendix 1—table 3), in the precuneus (d = 0.79), the left temporo-parietal junction (TPJ; d = 0.59) and the medial prefrontal cortex (mPFC; d = 0.54). This also replicates previous findings associating this region with social decisions (e.g., Fareri et al., 2012; Jung et al., 2013; Nicolle et al., 2012; Ogawa et al., 2018; Piva et al., 2019).',
              'Only the precuneus and TPJ showed positive differences in both comparisons (Figure 4C), indicating that these regions were most active when participants chose the lottery in the Social condition, the critical situation in which participants assume responsibility over others.',
            ],
          },
          {
            id: 'results-bold-outcomes',
            label: 'Brain regions engaged during receipt of outcomes',
            depth: 3,
            paragraphs: [
              'Next, we focused on responses during choice outcomes. A cluster of voxels more active during receipt of lottery outcomes than outcomes of safe choices was identified in the bilateral anterior insula, dorsal mPFC (dmPFC), right superior temporal sulcus (STS), bilateral ventral striatum, right dorsolateral prefrontal cortex, and bilateral inferior parietal lobe (Figure 4D; for details including effect sizes, see Appendix 1—table 7). Except for the STS, all these regions have been previously associated with processing of risk and/or ambiguity (Wu et al., 2021).',
              'To identify regions likely to be involved in the guilt effect, we selected those satisfying two conditions: higher activity in the Social compared to the Partner condition, and a significant Social:LowOutcome interaction. This procedure revealed the insulae (Figure 4E) and the right middle temporal cortex (trend significant Social vs. Partner difference in the latter region). Thus, activation in our insula ROIs increased in situations during which participants experienced guilt for low outcomes impacting their partner, compared to similar outcomes resulting from the partner\'s choices.',
              'To attempt to confirm these results with a classic fine-grained mass-univariate voxel-wise analysis, we searched, within regions responding more to outcomes of risky compared to safe choices, for higher responses to low lottery outcomes for the partner following participant choices compared to the same outcomes resulting from partner choices. We found a weak response in a small cluster within the left anterior insula (peak T = 3.95, d = 0.59, 22 voxels, peak intensity at [–28 24 –4]; Figure 4F). This result, although it is only a small effect in a small cluster, is consistent with the mixed model analysis reported earlier.',
            ],
          },
          {
            id: 'results-bold-rpe',
            label: 'Neural correlates of responsibility for partner reward prediction errors revealed by computational model-based analysis',
            depth: 3,
            paragraphs: [
              'Next, we attempted to explain BOLD responses using predictions of the \'Responsibility\' computational model (see Behaviour/Computational modelling of happiness data, above). We found that activation in bilateral ventral striatum indeed increased with the amount of expected certain rewards and the expected values of chosen lotteries (left: pFWE = 0.002, T = 5.63, d = 0.75, Z = 5.41, 110 voxels, peak at MNI [–14 8 –8], right: pFWE = 0.005, T = 5.46, d = 0.70, Z = 5.26, 80 voxels, peak at MNI [10 10 −4]; Figure 4G). We found this effect in one cluster within the left STS (pFWE = 0.022, T = 4.70, d = 0.53, Z = 4.57, 100 voxels, peak at MNI [−52 –32 0]; Figure 4H). This finding suggests that this region of the left STS tracks a partner\'s unexpected outcomes less when they do not follow from the participant\'s decisions.',
            ],
          },
          {
            id: 'results-bold-connectivity',
            label: 'Functional connectivity',
            depth: 3,
            paragraphs: [
              'Functional connectivity analyses have revealed differences in networks engaged by social and self-only choices (Jung et al., 2013; Ogawa et al., 2018), interactions between midbrain and anterior cingulate during compensation for guilt (Yu et al., 2014), and links between insula connectivity and responsibility aversion (Edelson et al., 2018). We hypothesized that connectivity with regions that showed guilt- and responsibility-related responses during the outcome phase might change depending on whether participants made decisions for themselves only or for themselves and their partner, and depending on the type of choice (Safe or Risky).',
              'The first analysis revealed a cluster in the right IFG whose connectivity to the insula (the seed region) was highest when participants made Risky choices for themselves and Safe choices for both players (pFWE = 0.020, T = 4.34, d = 0.80, Z = 4.21, 115 voxels, peak at MNI [46 16 22]; Figure 5). A smaller cluster in the left IFG showed the same effect but did not survive correction for multiple tests. The second analysis revealed a smaller cluster in the left IFG where connectivity with the left STS showed the opposite pattern: connectivity was highest when participants made Safe choices for themselves and Risky choices for both players.',
            ],
          },
          {
            id: 'results-bold-grbs',
            label: 'Comparison with multivariate neural guilt signature (Yu et al., 2020)',
            depth: 3,
            paragraphs: [
              'A recent study by Yu and colleagues re-analysed the results of two previous neuroimaging studies of guilt and obtained a neural multivariate guilt-related brain signature (GRBS) (Yu et al., 2020). We compared this brain signature to the neural responses obtained in our task. The dot products between individual responses and the GRBS varied between –40.1 and 36.7, but overall these values were positive (mean = 5.22; median = 6.97; sign test: p = 0.017; Cliff\'s Delta = 0.4 = medium effect size). We assessed whether inter-individual differences in these dot product values correlated with the behavioural guilt responses, but did not find a significant association [Spearman\'s Rho = –0.058, p = 0.725].',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'discussion',
    label: 'Discussion',
    depth: 1,
    paragraphs: [
      'We report findings from an experiment on social responsibility and guilt in risky economic decisions, and their neural correlates. Being responsible for choosing a lottery that yielded a low outcome for a partner made our participants feel worse than witnessing the same outcome resulting from their partner\'s choice, which we interpret as interpersonal guilt; although we note that we have not asked participants specifically about which emotion they felt in these situations. Activation in the left anterior insula (aIns) reflected this effect, replicating previous associations between this region and feelings of guilt. Whole-brain activation patterns also resembled a neurometric marker of guilt (Yu et al., 2020). Connectivity between aIns and the right IFG varied depending on whether participants chose the risky or safe option and whether only the participant or both themselves and the partner were affected by the outcome of this choice, suggesting that this part of prefrontal cortex is sensitive to guilt-related information during social choices. Computational models explained trial-by-trial variations in momentary happiness during the task; the best-fitting model differentiated between partner reward prediction errors resulting from participant and partner choices, indicating that the impact of outcomes for the partner on participants\' happiness varied depending on who chose. This confirms the importance of responsibility in determining the emotional consequences of risky social choices. fMRI analyses based on this computational model identified a left STS region responding more to partner reward prediction errors resulting from participant rather than partner choices. This suggests a critical role of the STS in monitoring the consequences of one\'s risky decisions on others, an essential social cognitive function. A last analysis showed that connectivity between this STS region and the right IFG varied depending on condition and choice, suggesting that the information processed in the STS is relayed to the IFG during social decisions. Our findings add to current understanding of the neural mechanisms underlying responsibility for, and guilt evoked by, the outcomes on others of social decisions under economic risk.',
      'We used several approaches to compare choices made for self only or for both participant and partner. Participants made slightly more risk-seeking choices when deciding for themselves than for both themselves and the partner in Study 1, but this difference disappeared in Study 2. The ρ parameter on which this finding in Study 1 is based could only be estimated in a minority of participants due to a relatively low number of trials, which suggests that this finding may not be very reliable. The simpler and more robust method (evaluation of a risk premium) showed no difference in risk aversion across conditions in either study. Overall, we believe that we do not have strong evidence of differences in risk preferences across conditions. Our findings are not unexpected given previous work. At least two studies reported that being responsible for somebody else\'s payoffs increases risk aversion (Fareri et al., 2022; Pahlke et al., 2015). However, participants in a recent neuroimaging study were more loss averse when choosing for themselves rather than known other people (Arioli et al., 2023). Indeed, recent large meta-analyses comparing risky choices for oneself vs. for others report either no difference in risk preferences (Batteux et al., 2019) or a small shift towards more risky decisions for others (Polman and Wu, 2020), with large variations across studies. Personal closeness to the others for which we decide seems to reduce differences in risk preferences (Fareri et al., 2022; Zhang et al., 2017), as does making decisions for self before making decisions for others (Ifcher and Zarghamee, 2020). In our study, decisions never only affected the partner, which most likely \'watered down\' any differences in risk attitude in decisions for oneself vs. for someone else. We also created a friendly prosocial environment in which people felt closer to each other than two strangers would (see Experiment Partner in Methods), and interleaved decisions for self only vs. for self and other. Similar risk preferences in decisions for self vs. self and other are thus unsurprising. The fact that participants made similarly risky decisions for themselves or for both during the fMRI study was to our advantage, because it made the neural signals evoked in these situations more comparable.',
      'Anterior insula (aIns) response, particularly in the left hemisphere, was highest when partners received low lottery outcomes resulting from participants\' risky choices. This replicates a large body of evidence associating aIns with feelings of guilt evoked during social decisions (see Introduction). Because we have neither asked our participants specifically what they felt in these situations, nor specifically whether they experienced guilt, we cannot exclude the possibility that they have instead or in addition felt empathy for their partner, a feeling of failure or bad luck, or some other emotion. The aIns region has also been associated with empathy for negative emotions such as disgust (Wicker et al., 2003) or pain (Gu et al., 2012; Lamm et al., 2011), with affective empathy during charitable giving (Tusche et al., 2016), and more generally with emotion awareness (Bird et al., 2010; Gu et al., 2013). These functions might be supported by interoception (Craig, 2002): posterior insula is thought to receive interoceptive information from the body and to pass it on to the anterior insula for integration with sensory, emotional, cognitive, and motivational signals from other regions (Craig, 2009; Rogers-Carter and Christianson, 2019). This integration would allow one to represent one\'s own, as well as estimates of other people\'s, feelings and bodily states and allow error-based learning based on these (Lamm and Singer, 2010; Rogers-Carter and Christianson, 2019; Singer et al., 2009). Our finding of changing functional connectivity between aIns and prefrontal cortex as a function of decision taken and experimental condition during choice may reflect changing emotional information transfer between these structures depending on choice and social context. How we feel when we witness our decisions\' consequences on others is an important signal to consider when attempting to make good social decisions. Unsurprisingly, lesions of aIns are associated with reduced altruistic attitudes (Chau et al., 2018), individuals with higher levels of psychopathic traits show reduced modulation of aIns response to anticipated guilt (Seara-Cardoso et al., 2016), and show reduced guilt aversion (Gong et al., 2019).',
      'Deciding for both self and partner rather than just for oneself evoked increased activations in precuneus, left TPJ, and dmPFC, areas classically associated with social cognition (Frith and Frith, 2006; Schurz et al., 2014; Van Overwalle, 2009), and also with feelings of guilt (for meta-analyses, see Gifuni et al., 2017; Piretti et al., 2023). This replicates previous findings of engagement of dmPFC, STS, and/or TPJ when making decisions involving others (Jung et al., 2013; Nicolle et al., 2012; Ogawa et al., 2018; Piva et al., 2019). Interestingly, our computational model-based analysis revealed a cluster of voxels in the left STS that responded positively to partner prediction errors, but only when these resulted from decisions made by the participant instead of the partner. This is congruent with associations between STS and cognitive perspective taking during charitable giving (Tusche et al., 2016), representation of other people\'s interests during altruistic choice (Hutcherson et al., 2015), or more generally with mentalizing computations during strategic social choice (Carter et al., 2012; Hampton et al., 2008; Hill et al., 2017). The features of our experimental design (direct contrast of similar decisions made by the participant and partner; independent lottery outcomes for self and other; quantification of the consequences of decisions through variations of momentary happiness) allowed us to identify this very specific neural signal indicative of a neural sensitivity to the consequences of one\'s own actions on others, whether positive or negative. A neural signal coding partner reward prediction errors resulting from one\'s decisions seems essential to guide social decisions and as a basis for empathic concern for the people influenced by our actions. Anecdotally, we found a weak functional connection between this left STS cluster and left aIns that varied as a function of choice and experimental condition; this is interesting because connections between a region in the left TPJ and aIns have been shown to vary depending on people\'s tendency to seek or avoid responsibility for others (Edelson et al., 2018). Given the roles of the left STS/TPJ and aIns in guilt and social decisions, it is not surprising to find information exchanges between these structures. More experiments investigating specific computations in which these regions are involved are likely to help understand the neural mechanisms by which guilt and responsibility influence social decision-making.',
      'There are several limitations to our study. The first limitation is that the partner\'s decisions were in fact taken by an algorithm. This was not communicated to the participants and was thus a case of deception, which is inadmissible in behavioural economics. To our defence, this study was planned as a social neuroscience study and was executed before we had taken into account the practices of behavioural economists. However, this approach did have the advantage of eliminating potentially complex iterative reciprocal influences of decisions and outcomes between the players, which would have led to much more complicated emotional states and decisions that would have been difficult to understand and model. Thus, from an analytical point of view, our approach might have actually allowed a cleaner comparison between decisions and outcomes than if the partner had really made the decisions. The fact that partner outcomes also influenced participants\' momentary happiness demonstrates that participants were not emotionally detached from the consequences of their actions on their partner. This finding is, of course, essential for the validity of our results and suggests that the effects could get stronger with more direct interactions. Therefore, although we will abstain from using deceptive practices when pursuing this research, we believe our findings to be valid.',
      'Another limitation is that we have not asked participants to specifically name emotions as they proceeded through the experiment. As a result, we cannot ascertain whether people experienced guilt, shame, regret, disappointment or another specific emotion during the experiment. However, asking about specific emotions is itself associated with several drawbacks: emotion labels might have coloured participants\' spontaneous emotional state; participant responses might be influenced by social desirability; thinking about which emotion best characterizes one\'s mental state takes time and distracts from the decision task; and the list of emotions to choose from is necessarily limited. In any case, the precise naming of emotions was not the aim of our study; instead, we relied on a definition of guilt from psychological game theory (Battigalli and Dufwenberg, 2007). Indeed, previous work on social emotions recommends \'study the experiential phenomenology of emotions instead of mere emotion labels\', because \'as a psychological explanation of human behaviour, the phenomenological experience of an emotion is much more important than the label attached to this experience\' (Zeelenberg and Breugelmans, 2008). The \'neurometrics\' analysis of our guilt-related activation maps showed a significant similarity to a published guilt-related brain signature (Yu et al., 2020). We thus believe that our participants did experience guilt when their choices led to low outcomes for their partner.',
      'Several open questions remain at the end of this study. As discussed above, asking participants directly about which emotions they have felt during the different stages of this task would allow us to link subjective experience with our analytical measures. Testing more participants would allow us to assess the impact of inter-individual variations in personality traits on the experience as well as the behavioural and neural correlates of guilt and responsibility. Using more trials in the experiment would allow separate modelling of risk preferences in gain and loss trials in each experimental condition using expected utility models, and could allow testing whether changes in momentary happiness affect subsequent choices. Varying partner identities (friends, stranger, and artificial agent) could reveal the impact of social discounting on guilt and responsibility. Functional connectivity analyses could also be performed for the data obtained in the feedback part of the paradigm. In sum, we believe that this experimental approach lends itself very well to the study of several aspects of social emotions.',
    ],
  },
  {
    id: 'methods',
    label: 'Materials and methods',
    depth: 1,
    paragraphs: [],
    children: [
      {
        id: 'methods-participants',
        label: 'Participants',
        depth: 2,
        paragraphs: [
          'Forty healthy participants (14 male, mean age 26.1, range 22–31) participated in Study 1 (behaviour only study), and 44 healthy participants (19 male, mean (SD) age = 30.6 (6.5), range 23–50) participated in Study 2 (fMRI study). All participants provided written informed consent. Participants were recruited from the local population through advertisements on online blackboards at the University of Bonn and on local community websites, and through flyers posted in libraries, university cafeterias and sports facilities. The number of participants recruited in Study 2 corresponds to the sample size estimated using G*Power 3.1 software (Faul et al., 2007) for a two-way t-test assessing the difference between two means (matched pairs) based on the results of Study 1 (Cohen\'s d = 0.56), with alpha error = 0.05 and power (1 − beta) = 0.95, the required sample size was 44. The fMRI data from four participants in Study 2 were excluded from the fMRI data analysis because of excessive head motion (>3 mm or >3°).',
        ],
      },
      {
        id: 'methods-procedure',
        label: 'Experimental procedure',
        depth: 2,
        paragraphs: [
          'The design of the experiment was inspired by previous studies investigating how risky choices and their consequences influence momentary happiness (Rutledge et al., 2014; Rutledge et al., 2016). It was implemented in MATLAB (Version R2016b) using the Psychtoolbox extensions.',
        ],
      },
      {
        id: 'methods-partner',
        label: 'Experiment partner',
        depth: 2,
        paragraphs: [
          'Participants played with a friendly same-sex experiment partner (pairs of participants in Study 1, authors TW and MG in Study 2), whom they met before the scan for an introduction session. In this session lasting about 15 min, participants played an ice breaker game with their experiment partner, in which both participant and partner took turns in drawing one half of a simple picture while being blindfolded and following verbal instructions given by their game partner. Encouragements and other positive feedback were given by the partner throughout the task. This icebreaker game led to an agreeable social atmosphere and positive, non-competitive, sympathetic attitude between the participants and the partner. Results of a brief questionnaire indicate that this approach was successful: participants\' average ratings of their partners in terms of sympathy, cooperativity, honesty, openness and sociability were all above 8 on a scale of 1–10, in both studies.',
        ],
      },
      {
        id: 'methods-task',
        label: 'Decision task',
        depth: 2,
        paragraphs: [
          'Following the icebreaker game, participants in Study 1 performed three sessions of a task in which they decided on each trial between a safe and a risky monetary option (Figure 1). The risky monetary option was a lottery with two equiprobable outcomes (lottery). There were three kinds of trials: decisions by the participant only for themselves (Solo condition), decisions by the participant for themselves and the partner (Social condition), and decisions by the partner for both themselves and the participant (Partner condition). Importantly, when the risky option was selected in the Social or Partner condition, the lottery was played out independently for the participant and the partner, such that both could receive the higher (HighOutcome) or lower outcome (LowOutcome), independently from each other. In order to ascertain constant decisions by the partner, the partner\'s decisions were simulated using a simple algorithm that always selected the option with the highest expected value.',
          'There were 20 mixed trials, 20 gain trials, and 20 loss trials per session. In the mixed trials, participants chose between a safe option of 0 € and a lottery consisting of a gain and a loss amount. Gain amounts were selected randomly from: [15, 25, 40, 55, 75] cents. In gain trials, participants chose between a safe gain out of [10, 15, 20, 25, 30] cents and a lottery with 0 € and a higher gain amount. In loss trials, participants chose between a certain loss or a lottery with 0 € or a larger loss. The position of the safe and risky option on the screen (left or right) was determined randomly on every trial. Participants had unlimited time to choose between the safe or risky option. Decisions were displayed for 2 s and lottery outcomes for 2.5 s. Trials were separated in time by an inter-stimulus interval (ISI) of 1–2 s drawn randomly from a gamma distribution.',
        ],
      },
      {
        id: 'methods-happiness',
        label: 'Momentary happiness',
        depth: 2,
        paragraphs: [
          'Every two trials, one ISI after the outcome of the previous trial, participants were asked \'How happy are you right now?\'. They could respond by selecting a value on a scale from \'very happy\' (right) to \'very unhappy\' (left) by moving a cursor with a button press. The start position of the cursor was the midpoint of the scale, and the scale had 100 selectable options. For analysis, happiness ratings were Z-scored to cancel out effects of different rating variabilities across participants.',
        ],
      },
      {
        id: 'methods-study-diff',
        label: 'Difference between studies 1 and 2',
        depth: 2,
        paragraphs: [
          'In Study 2, participants performed two sessions of the experiment described above inside the fMRI scanner. All parameters were identical except that ISIs varied from 3 to 11 s (drawn randomly from a gamma distribution). In Study 2, instead of playing against another same-sex participant, participants played either against experimenter MG or TW depending on sex (participant and partner were always of same sex) who were outside the scanner.',
        ],
      },
      {
        id: 'methods-stats',
        label: 'Statistical analysis',
        depth: 2,
        paragraphs: [
          'Statistical analysis was performed using Matlab R2024A and the lme4 package in R (version 4.2.1), and JASP (version 0.16.1). fMRI data were analysed using SPM12 software (Wellcome Trust Centre for Neuroimaging, London, UK). All statistical tests were two-tailed. Bayes factors were calculated using default priors in JASP and express the probability of the data given H1 relative to H0 (BF10, values larger than one are in favour of H1). Effect sizes were calculated using standard approaches implemented in Matlab.',
          'For the main happiness analysis, we used a mixed-effects logistic regression with subject-specific random intercepts and slopes. The choice of the risky option was entered as the dependent variable, and explanatory variables were the difference between the expected value of the lottery minus the value of the safe option (EVdiff) and condition (Cond: 1 = Solo, 2 = Social), as well as the interaction between them. All explanatory variables were mean-centred.',
        ],
      },
      {
        id: 'methods-fmri-acq',
        label: 'fMRI data acquisition and pre-processing',
        depth: 2,
        paragraphs: [
          'Functional MRI data were acquired on a Siemens Prisma 3T scanner. Whole-brain BOLD images were acquired using a multiband EPI sequence. Anatomical T1-weighted images were acquired for each participant. Data were preprocessed using standard SPM12 procedures, including realignment, slice-timing correction, coregistration with the anatomical image, normalisation to MNI space, and spatial smoothing. Participants with head motion exceeding 3 mm translation or 3° rotation were excluded from the analysis.',
        ],
      },
      {
        id: 'methods-fmri-analysis',
        label: 'fMRI data analysis',
        depth: 2,
        paragraphs: [
          'For fMRI data analysis, we used a General Linear Model (GLM) approach with SPM12. Fixed-effects models were estimated at the individual participant level, and random-effects analyses at the group level. Regressors of interest were convolved with the canonical hemodynamic response function. To identify regions involved in guilt and social decision-making, contrasts were computed comparing activity across experimental conditions (Solo, Social, Partner) and outcome types (High, Low) at the group level.',
          'Psychophysiological interaction (PPI) analyses were conducted to assess changes in functional connectivity during the decision phase. The seed regions were the left anterior insula (aIns) and the left STS cluster identified in the model-based analysis. PPI regressors were computed as the element-wise product of the deconvolved time series from each seed region and the psychological regressor of interest (e.g., Solo Risky vs. Social Safe). Group-level PPI analyses used random-effects linear mixed models.',
        ],
      },
    ],
  },
];
