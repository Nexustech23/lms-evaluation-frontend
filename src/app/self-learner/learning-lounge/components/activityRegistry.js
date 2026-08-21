import CaseStudyBlock from "./activities/CaseStudyBlock";
import ChoiceBlock from "./activities/ChoiceBlock";
import CodeTraceBlock from "./activities/CodeTraceBlock";
import CommonMistakesBlock from "./activities/CommonMistakesBlock";
import ComparisonBlock from "./activities/ComparisonBlock";
import ConceptBlock from "./activities/ConceptBlock";
import DebuggingLabBlock from "./activities/DebuggingLabBlock";
import FormulaWalkthroughBlock from "./activities/FormulaWalkthroughBlock";
import GuidedWalkthroughBlock from "./activities/GuidedWalkthroughBlock";
import MentalModelBlock from "./activities/MentalModelBlock";
import ParameterExplorerBlock from "./activities/ParameterExplorerBlock";
import PracticalActivityBlock from "./activities/PracticalActivityBlock";
import WorkedExampleBlock from "./activities/WorkedExampleBlock";

function PredictionBlock(props) {
  return <ChoiceBlock {...props} mode="prediction" />;
}

function QuickCheckBlock(props) {
  return <ChoiceBlock {...props} mode="check" />;
}

// This registry is the executable boundary. The AI may configure only these
// content blocks; unknown types are never interpreted as code.
export const activityRegistry = Object.freeze({
  concept: ConceptBlock,
  mental_model: MentalModelBlock,
  worked_example: WorkedExampleBlock,
  guided_walkthrough: GuidedWalkthroughBlock,
  formula_walkthrough: FormulaWalkthroughBlock,
  comparison: ComparisonBlock,
  code_walkthrough: CodeTraceBlock,
  common_mistakes: CommonMistakesBlock,
  practical_activity: PracticalActivityBlock,
  case_study: CaseStudyBlock,
  debugging_lab: DebuggingLabBlock,
  parameter_explorer: ParameterExplorerBlock,
  prediction: PredictionBlock,
  quick_check: QuickCheckBlock,
});
