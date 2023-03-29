import { View, Text, Image, StyleSheet, useWindowDimensions, Pressable, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomButton from '../../components/CustomButton/CustomButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import questions from "../../data/QuestionnaireData";

const QuestionnaireScreen = () => {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();

  // Pull JSON data from QuestionnaireData
  const data = questions;
  // Option Index
  const [index, setIndex] = useState(0)
  // Question Indentifier
  const route = useRoute();
  const [identifier, setIdentifier] = useState("general_1");
  // Skip general questions if coming from Image Analyzer screen
  useEffect(() => {
    if (route.params.prediction !== null) {
      switch (true) {
        case route.params.prediction.includes("Bunions"):
          setIdentifier("bunion_1");
          break;
        case route.params.prediction.includes("Claw or Hammer Toes"):
          setIdentifier("claw_hammer_1");
          break;
        case route.params.prediction.includes("Corn or Calluses"):
          setIdentifier("corn_callus_1");
          break;
        case route.params.prediction.includes("Healthy Feet"):
          break;
        default:
          break;
      }
      console.log(route.params.prediction);
      console.log(identifier);
    }
  }, [route.params.prediction]);


  // Answers
  const [answers, setAnswers] = useState([]);
  // Selected Answer
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [previousQuestions, setPreviousQuestions] = useState([]);

  // Time complexity: O(n)
  const currentQuestion = data.find((item) => item.identifier === identifier);

  useEffect(() => {
    setSelectedAnswerIndex(null);
  }, [identifier])

  // Set question colour based on yes/no answer or multiple choice question
  const questionColourLogic = (index) => {
    if (currentQuestion.yesOrNo == true) {
      if (selectedAnswerIndex === 0 && index == 0) {
        return styles.questions_selected_yes
      } else if (selectedAnswerIndex === 1 && index == 1) {
        return styles.questions_selected_no
      } else {
        return styles.questions
      }
    } else {
      if (selectedAnswerIndex !== null && selectedAnswerIndex === index) {
        return styles.questions_selected_neutral;
      } else {
        return styles.questions
      }
    }
  }

  // Logic for determining next question based on yes or no answer
  const yesOrNoQuestionLogic = () => {
    if (selectedAnswerIndex === 0) {
      return currentQuestion?.nextQuestionIdentifierYes
    }
    else {
      return currentQuestion?.nextQuestionIdentifierNo
    }
  }

  // Logic for determining next question based on multiple choice answer
  const multipleChoiceQuestionLogic = () => {
    const choices = {
      "general_2": ["bunion_1", "claw_hammer_1", "claw_hammer_1", "corn_callus_1", "corn_callus_1"],
      "general_4": ["bunion_1", "claw_hammer_1", "claw_hammer_1", "corn_callus_1", "corn_callus_1"],
      "general_5": ["claw_hammer_1", "corn_callus_1", "bunion_1", "corn_callus_1", "claw_hammer_1", "bunion_1"]
    }

    if (currentQuestion?.identifier && choices[currentQuestion.identifier]) {
      return choices[currentQuestion.identifier][selectedAnswerIndex] || null;
    }
    return null;
  }

  // Handles logic for button rendering and functionality
  const buttonLogic = () => {
    // If the current question has no "yes" branch, and the user has selected "yes", and the "yes" result is not null, 
    // or if the current question has no "no" branch, and the user has selected "no", and the "no" result is not null,
    // display a "See Results" button.
    return (currentQuestion?.nextQuestionIdentifierYes === null && currentQuestion?.yesResult != null && selectedAnswerIndex === 0) ||
      (currentQuestion?.nextQuestionIdentifierNo === null && currentQuestion?.noResult != null && selectedAnswerIndex === 1) ? (
      <CustomButton
        text="See Results"
        onPress={() => {
          // When the "See Results" button is pressed, create a new answer object and add it to the answers array.
          const answer = {
            question: currentQuestion?.question,
            answer: currentQuestion?.options[selectedAnswerIndex].answer,
            result: selectedAnswerIndex === 0 ? currentQuestion?.yesResult : currentQuestion?.noResult,
          };
          const updatedAnswers = [...answers, answer];
          // Navigate to the ResultScreen and pass the updated answers array as a parameter.
          navigation.navigate("ResultScreen", { answers: updatedAnswers });
        }}
      />
    ) : selectedAnswerIndex !== null ? (
      // If the user has selected an answer but the conditions for displaying the "See Results" button are not met,
      // display a "Next Question" button.
      <CustomButton
        text="Next Question"
        onPress={() => {
          // Determine the ID of the next question based on the current question's type (yes/no or multiple choice).
          const nextQuestionId = currentQuestion?.yesOrNo === true ? yesOrNoQuestionLogic() : multipleChoiceQuestionLogic();
          // Set the next question ID as the new identifier for the quiz.
          setIdentifier(nextQuestionId);
          previousQuestions.push(currentQuestion?.identifier);
          answers.push({
            question: currentQuestion?.question,
            answer: currentQuestion?.options[selectedAnswerIndex].answer
          });
          console.log(previousQuestions);
          console.log(answers);
        }}
      />
    ) : null; // If the user has not yet selected an answer, do not display any button.
  }


  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.root}>

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Tell Us About Your Feet!</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{currentQuestion?.question}</Text>

          <View style={styles.imageContainer}>
            {currentQuestion?.imagePath && (
              <Image
                source={currentQuestion.imagePath}
                resizeMode="contain"
                style={{
                  height: height * 0.3,
                  maxWidth: 300,
                }}
              />
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            {currentQuestion?.options.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedAnswerIndex(index)}
                style={
                  questionColourLogic(index)
                }
              >
                <Text style={styles.options}>{item.option}</Text>
                <Text style={styles.answer}>{item.answer}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {
          selectedAnswerIndex === null ? null : (
            <Text style={{ fontSize: 17, textAlign: 'center', fontWeight: 'bold' }}>Toe-rific!</Text>
          )
        }
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <View style={[styles.button, { width: width * 0.25 }]}>
            {previousQuestions.length !== 0 && (
              <CustomButton
                text="Previous Question"
                onPress={() =>
                  setIdentifier(
                    previousQuestions[previousQuestions.length - 1],
                    previousQuestions.pop(),
                    answers.pop(),
                    console.log(previousQuestions),
                    console.log(answers)
                  )
                }
              />
            )}
            {buttonLogic()}
          </View >
        </View >
      </View >
    </ScrollView >
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 40,
  },
  logo: {
    width: '100%',
    maxWidth: 250,
    maxHeight: 250,
  },
  button: {
    flexDirection: 'row',
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    //width: 130,
  },
  questions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#AEC6CF',
    marginVertical: 10,
    borderRadius: 30,
  },
  questions_selected_neutral: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#AEC6CF',
    marginVertical: 10,
    borderRadius: 30,
    backgroundColor: '#AEC6CF',
  },
  questions_selected_yes: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#77DD77',
    marginVertical: 10,
    borderRadius: 30,
    backgroundColor: '#77DD77',
  },
  questions_selected_no: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF6961',
    marginVertical: 10,
    borderRadius: 30,
    backgroundColor: '#FF6961',
  },
  options: {
    textAlign: 'center',
    width: 40,
    height: 40,
    padding: 10,
  },
  answer: {
    marginLeft: 10,
  },
  imageContainer: {
    flex: 1,
    paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default QuestionnaireScreen