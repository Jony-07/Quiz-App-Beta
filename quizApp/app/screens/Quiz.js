import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, StatusBar, Image, TouchableOpacity, Modal, Animated, ScrollView } from "react-native";
import { COLORS, SIZES } from "../constants";
//import data from "../data/QuizData";
import axios from "axios";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Colors } from "react-native/Libraries/NewAppScreen";

const Quiz = () => {
    
    const[allQuestions, setAllQuestions]=useState([]);
    useEffect(()=>{
        const obtenerClientesApi = async ()=>{
            try {
                const resultado = await axios.get('http://10.0.2.2:3000/preguntas');
                setAllQuestions(handleShuffle(resultado.data));
            } catch (error) {
                console.log(error)
            }
        }
        obtenerClientesApi();
    },[])



    const handleShuffle = (options) => {
        return options.sort(() => Math.random() - 0.5);
      };

    const[currentOptionSelected, setcurrentOptionSelected]= useState(null);
    const[correctOption, setcorrectOption] = useState(null);
    const[options, setOptions]=useState([]);
    const[isOptionDisabled,setisOptionDisabled] = useState(false)
    const[currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const[showNextButton, setShowNextButton] = useState(false);
    const[score, setScore]= useState(0);
    const[showScoreModal, setShowScoreModal]= useState(false);
    const[progress, setProgress]=useState(new Animated.Value(0));
    const progressAnim = progress.interpolate({
        inputRange: [0, allQuestions.length],
        outputRange:['0%','100%']
    })
    const renderProgressBar = ()=>{
        return(
            <View style={{
                width:'100%',
                height:20,
                borderRadius:20,
                backgroundColor:'#00000020',
            }}>
                <Animated.View style={[{
                    height:20,
                    borderRadius:20,
                    backgroundColor:COLORS.accent
                },{
                    width:progressAnim
                }]}>

                </Animated.View>
            </View>
        )
    }
    const restartQuiz = () =>{
        setShowScoreModal(false);
        setCurrentQuestionIndex(0);
        setScore(0);

        setcurrentOptionSelected(null);
        setcorrectOption(null);
        setisOptionDisabled(false);
        setShowNextButton(false);

        Animated.timing(progress, {
            toValue:0,
            duration:1000,
            useNativeDriver:false
        }).start();
    }
    const validateAnswer = (selectedOption) =>{
        let correct_options = allQuestions[currentQuestionIndex]['correct_option'];
        setcurrentOptionSelected(selectedOption);
        setcorrectOption(correct_options);
        setisOptionDisabled(true);
        if(selectedOption===correct_options){
                setScore(score+1)
        }
        setShowNextButton(true);
    } 
    const handleNext = () =>{
        if(currentQuestionIndex===allQuestions.length-1){
            setShowScoreModal(true);
        }else{
            setCurrentQuestionIndex(currentQuestionIndex+1);
            setcurrentOptionSelected(null);
            setcorrectOption(null);
            setisOptionDisabled(false);
            setShowNextButton(false);
        }
        Animated.timing(progress, {
            toValue:currentQuestionIndex+1,
            duration:1000,
            useNativeDriver:false
        }).start();
    }
    const renderQuestion = () =>{
        return(
            <View>
            <View
            style={{
              flexDirection:'row',
              alignItems:'flex-end' 
            }}>
                <Text style={{color:COLORS.white, fontSize:20, opacity:0.6, marginRight:2}}>{  currentQuestionIndex + 1}</Text>
                <Text style={{color:COLORS.white, fontSize:18, opacity:0.6, marginRight:2}}>/ {allQuestions.length}</Text>
            </View>

            {/** Question */}

            <Text style={{
                color:COLORS.white,
                fontSize:30
            }}>{allQuestions[currentQuestionIndex]?.question}  </Text>
        </View>
        )
    }
    const renderOptions = () =>{
        return (
            <View>
                {
                    allQuestions[currentQuestionIndex]?.options.map(option => (
                        <TouchableOpacity
                        onPress={()=> validateAnswer(option)}
                        disabled={isOptionDisabled}
                        key={option}
                        style={{
                            borderWidth:3,
                            borderColor: option==correctOption
                            ? COLORS.success
                            : option == currentOptionSelected
                            ? COLORS.error
                            :
                            COLORS.secondary + '40',
                            backgroundColor: option==correctOption
                            ? COLORS.success + '20'
                            : option == currentOptionSelected
                            ? COLORS.error + '20'
                            :
                            COLORS.secondary + '20',
                            height:60,
                            borderRadius:20,
                            flexDirection:'row',
                            alignItems:'center',
                            justifyContent:'space-between',
                            paddingHorizontal: 20,
                            marginVertical:10

                        }}>
                            <Text style={{fontSize:20, color:COLORS.white}}>{option}</Text>
                            {
                                option===correctOption ?(
                                    <View style={{
                                        width:30, height:30, borderRadius:30/2,
                                        backgroundColor:COLORS.success,
                                        justifyContent:'center', alignItems:'center'
                                    }}>
                                    <MaterialCommunityIcons name="check" style={{
                                            color: COLORS.white,
                                            fontSize: 20
                                        }} />

                                    </View>
                                ): option === currentOptionSelected ? (
                                    <View style={{
                                        width:30, height:30, borderRadius:30/2,
                                        backgroundColor:COLORS.error,
                                        justifyContent:'center', alignItems:'center'
                                    }}>
                                     <MaterialCommunityIcons name="check" style={{
                                            color: COLORS.white,
                                            fontSize: 20
                                        }} />

                                    </View>
                                ):null
                            }
                        </TouchableOpacity>
                    ))
                }
            </View>
        )
    }
    const renderNexyButton = () =>{
        if(showNextButton){
            return(
                <TouchableOpacity
                onPress={handleNext}
                style={{
                    marginTop:20, width:'100%', backgroundColor:COLORS.accent, padding:20, borderRadius:5
                }}>
                    <Text style={{
                        fontSize:20, color:COLORS.white, textAlign:'center'
                    }}>Net</Text>
                </TouchableOpacity>
            )
        }
        else{
            return null;
        }
    }
    return(
        <SafeAreaView style={{flex:1}}>
            <StatusBar backgroundColor={COLORS.primary}  barStyle="light-content"/>
            <View style={{flex:1,
            paddingVertical: 40,
            paddingHorizontal:16,
            backgroundColor: COLORS.background,
            position:'relative'}}>

            {/**Progress Bar */}
            {renderProgressBar()}

            {/*Questions*/ }
                {renderQuestion()}
            {/**Options */}
                {renderOptions()}
            {/**New Button */}
                {renderNexyButton()}
            {/** Score Modal */}

            <Modal
            animationType="slide"
            transparent={true}
            visible={showScoreModal}>
            <View style={{
                flex:1,
                backgroundColor:COLORS.primary,
                alignItems:'center',
                justifyContent:'center'
            }}>
                <View style={{
                    backgroundColor:COLORS.white,
                    width: '90%',
                    borderRadius:20,
                    padding:20,
                    alignItems:'center'
                }}>
                    <Text style={{
                        fontSize:30,
                        fontWeight:'bold'
                    }}>
                        {score >(allQuestions.length/2)?'Congratulations!':'Oops!'}
                    </Text>
                    <View style={{
                        flexDirection:"row",
                        justifyContent:'flex-start',
                        alignItems:'center',
                        marginVertical:20
                    }}>
                    <Text style={{
                        fontSize:30,
                        color:score> (allQuestions.length/2)? COLORS.success: COLORS.error
                    }}>{score}</Text>
                    <Text style={{
                        fontSize:20, color:COLORS.black
                    }}>/ {allQuestions.length}</Text>
                    </View>
                    <TouchableOpacity style={{
                        backgroundColor:COLORS.accent,
                        padding:20, width:'100%',borderRadius:20
                    }}
                    onPress={restartQuiz}
                    >
                        <Text style={{
                            textAlign:'center', color:COLORS.white, fontSize:20
                        }}>Retry Quiz</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </Modal>

            {/**Backgroud Image  */}
            <Image
            source={require('../assets/images/DottedBG.png')}
            style={{
                width: SIZES.width,
                height: 130,
                zIndex:-1,
                position:'absolute',
                bottom:0,
                left:0,
                right:0,
                opacity: 0.5
            }
            }
            resizeMode={'contain'}
            />
            </View>
        </SafeAreaView>
    )
}

export default Quiz