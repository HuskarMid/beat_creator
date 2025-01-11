import React, { useState, useRef, useCallback } from 'react';
import './App.scss';
import * as Tone from 'tone';
import styled from 'styled-components';

const AvailibleInstruments = [
  {name: 'Kick #1', path: '/sounds/FullKick_07_641.wav'}, 
  {name: 'Clap #1', path: '/sounds/909Clap_02_146_SP.wav'},
  {name: 'HiHat #1', path: '/sounds/33_HiHat_SP_42_55.wav'},
  {name: '808 #1', path: '/sounds/uk-drill-808-bass.wav'}
]

const AvailableMelodies = [
  {name: 'Melody #1', bpm: 144, path: '/sounds/melody/looperman-l-2784143-0213659-rod-wave-piano-melody-stress-relief.wav'}, 
  {name: 'Melody #2', bpm: 130, path: '/sounds/melody/melody_2.wav'},
  {name: 'Melody #3', bpm: 110, path: '/sounds/melody/melody_3.wav'}
]

const TopBar = styled.div`
  width: 100%;
  height: 50px;

  background-color: #000000;
  margin: 5px 0px 6px 0px;
`;

const TopSection = styled.div`
  margin-bottom: 4px;
  height: 24px;
  background-color: #222222;
  display: flex;
  justify-content: flex-end;

`;

const TimeBarSection = styled.div`
  height: 25px;
  display: flex;
  border-bottom: 1px solid black;
  position: relative;
  box-sizing: border-box;
  width: 100%;
`;

const TimeBar = styled.div`
  background-color: black;
  height: 100%;
  border-right: 1px solid black;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  background-color: ${props => props.$index % 2 === 0 ? '#3C3C3C' : '#2C2C2C'};
  cursor: pointer;
`;

const TimeBarContentItem = styled.div`
  height: ${props => props.$index % 1 === 0 ? '8px' : '11px'};
  border-right: 1px solid #717171;
  &:last-child {
    border-right: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: 3px;
`;

const Button = styled.button`
  width: 24px;
  height: 24px;
  background-color: white;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  color: black;
  margin: 0 2px;
  outline: none;

  &:focus {
    outline: none;
  }

  &:first-child {
    margin-right: 5px;
  }
  
  &:hover {
    background-color: #ddd;
  }
`;

const PlayButton = styled(Button)`
  background-color: ${props => props.$isPlaying ? 'rgb(163, 60, 146)' : 'white'};
  color: ${props => props.$isPlaying ? 'white' : 'black'};
  margin-left: 15px;
  &:first-child {
    margin-right: 2px;
    margin-left: 0px;
  }
  font-size: 15px;
  outline: none;
  
  &:focus {
    outline: none;
  }
`;

const StopButton = styled(Button)`
  background-color: ${props => !props.$isPlaying ? '#f44336' : 'white'};
  color: ${props => !props.$isPlaying ? 'white' : 'black'};
  display: flex;

  padding: 0;
  line-height: 1;
  font-size: 22px;
  position: relative;

  p {
    position: absolute;
    top: 44%;
    left: 51%;
    transform: translate(-50%, -50%);
  }
  outline: none;
  
  &:focus {
    outline: none;
  }
`;

const TabsList = styled.div`
  width: 100%;
  position: relative;
`;

const TabsRow = styled.div`
  width: 100%;
  height: 50px;
  background-color: #2C2C2C;
  border-bottom: 1px solid black;
  display: flex;
  background-color: ${props => props.$rowIndex === 1 ? '#3C3C3C' : '#2C2C2C'};
`;

const TabsRowTab = styled.div`
  height: 100%;
  border-right: 1px solid black;
  background-color: ${props => props.$index % 2 === 0 ? '#3C3C3C' : '#2C2C2C'};
  position: absolute;
  left: ${props => props.$position}%;
  width: ${props => props.$width}%;
`;

const BottomBarSection = styled(TopBar)`
  margin: 3px 0px 0px 0px;
  background-color: #2C2C2C;
`;

const BottomTimeBar = styled(TimeBar)`
  justify-content: start;
`;

const TimeInfo = styled.div`
  color: #b6b6b6;
  font-size: 11px;
  display: flex;
  justify-content: flex-end;
  align-items: start;
  padding: 0px 5px 0px 0px;
`;

const TimeInfoNumber = styled.p`
  padding: 2px 0 0 0;
`

const BottomTimeInfo = styled(TimeInfo)`
  justify-content: start;
`;
const BottomTimeInfoNumber = styled(TimeInfoNumber)`
  padding: 2px 0 0 3px;
`;

const Timeline = styled.div`
  position: absolute;
  width: 2px;
  background-color: #ff0000;
  height: 100%;
  top: 0;
  left: ${props => props.$position}%;
  transition: left 0.1s linear;
  z-index: 1;
  opacity: ${props => props.$isPlaying ? 1 : 0};
`;

const TabsTimeline = styled.div`
  position: absolute;
  width: 2px;
  background-color: #ff0000;
  height: 100%;
  top: 0;
  left: ${props => props.$position}%;
  transition: left 0.1s linear;
  z-index: 2;
`;

const MidiTab = styled.div<{ $position: number; $width: number }>`
  position: absolute;
  height: 70%;
  background-color: rgba(255, 255, 0, 0.3);
  border: 1px solid yellow;
  border-radius: 4px;
  top: 15%;
  left: ${({ $position }) => $position}%;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  cursor: default;
  user-select: none;
  pointer-events: all;
  
  &:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 20%;
    height: 100%;
    cursor: ew-resize;
  }
  
  canvas {
    display: none;
  }
  
  canvas[data-mute="false"] {
    display: block;
  }
  
  &:active {
    transition: none;
  }
  
  &[style*="width"] {
    width: ${props => props.$width * 100}% !important;
  }
  
  min-width: 10px;
  max-width: 100%;
`;



const WaveformCanvas = styled.canvas<{ 
  $position: number; 
  $width: number; 
  $originalDuration: number 
}>`
  position: absolute;
  left: ${(props) => (props.$position / props.$originalDuration) * 100}%;
  width: ${(props) => Math.min(
    (props.$width / props.$originalDuration) * 100,
    100 - (props.$position / props.$originalDuration) * 100
  )}%;
  height: 100%;
`;

interface Note {
  id: number;
  time: number;
  duration: number;
  mute: boolean;
  instrumentId?: number;
  pitch: number;
}

const ContextMenu = styled.div`
  position: fixed;
  background: #2C2C2C;
  border: 1px solid #3C3C3C;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 120px;
  z-index: 1000;
`;

const MenuItem = styled.div`
  padding: 6px 12px;
  color: #fff;
  cursor: pointer;
  
  &:hover {
    background-color: #3C3C3C;
  }
`;

const NotesEditModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #2C2C2C;

  border-radius: 4px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  width: calc(1000px + 40px);
`;

const NotesEditToolbar = styled.div`
  width: 100%;
  height: 40px;
  background-color: #2C2C2C;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 5px;

`;

const EditToolbarButton = styled.button`
  height: 30px;
  padding: 0 15px;

  background-color: #3C3C3C;
  border: 1px solid #4C4C4C;
  color: white;
  cursor: pointer;
  border-radius: 3px;
  
  &:hover {
    background-color: #4C4C4C;
  }
  
  &:active {
    background-color: #2C2C2C;
  }

  &:last-child {
    margin-left: 10px;
    background-color: #f44336;

  }
`;


const NoteContainer = styled.div`
  width: 1000px;
  height: 1000px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const NotesInfo = styled.div`
  width: 40px;
  height: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NotesInfoItem = styled.div`
  width: 100%;
  height: calc(100% / 25);
  text-align: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Note = styled.div<{ $isActive: boolean; $colIndex: number }>`
  width: calc(100% / 32);
  height: calc(100% / 25);
  border: 1px solid #3C3C3C;
  background-color: ${props => {
    if (props.$isActive) {
      return '#ff69b4'; // Яркий цвет для активной ноты
    }
    return props.$colIndex >= 4 && props.$colIndex <= 7 ? '#1d1d1d' : 'transparent';
  }};
  cursor: pointer;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${props => 
      props.$isActive ? '#ff69b4' : 'rgba(255, 105, 180, 0.3)'};
  }
`;

const NotesContent = styled.div`
  display: flex;
  flex-direction: row;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const InstrumentsContainer = styled.div`
  width: 15%;
  height: 100vh;
  background-color: rgb(130, 47, 116);
  display: flex;
  flex-direction: column;
`;

const InstrumentsBody = styled.div`
  width: 100%;
  height: calc(100% - 61px - 50px);
  display: flex;
  flex-direction: column;
`;


const InstrumentsList = styled.div`
  width: 100%;
  height: 100%;
  background-color: #171717;
  border-right: 3px solid black;
`;

const InstrumentsLogo = styled.div`
  width: 100%;
  height: 61px;
  color: white;

  border-right: 3px solid black;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 12px;

  h1 {
    margin-left: 12px;
    font-weight: 400;
  }
`;

const InstrumentItem = styled.div`
  width: 100%;
  height: 50px;
  background-color: #2C2C2C;
  border-bottom: 1px solid black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  color: white;
  position: relative;
  font-size: 12px;

  span {
    position: absolute;
    left: 45px;
  }

  .controls {
    display: flex;
    align-items: center;
  }
`;

const VolumeSlider = styled.input`
  width: 60px;
  height: 3px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  margin: 0 10px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const DeleteInstrumentButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  
  &:hover {
    background-color: #d32f2f;
  }
`;


const InstrumentsMelodyList = styled.div`
  width: 100%;
  height: 60px;
  background-color: #171717;
  border-right: 3px solid black;
  border-top: 3px solid black;
  display: flex;
  flex-direction: column-reverse;

`;

const InstrumentsMelodyItem = styled(InstrumentItem)`
  height: 54px;
  background-color: #2C2C2C;
  border-bottom: 1px solid black;
  
  span {
    color: white;
  }
`;

const InstrumentsMelodyButton = styled(DeleteInstrumentButton)`
  background-color: #e2dd43;
  color: black;
  &:hover {
    background-color: #c8bb34;
  }
`;

const InstrumentAddButton = styled(DeleteInstrumentButton)`
  background-color: #4CAF50;
  padding: 2px 7px;
  font-size: 18px;

  &:hover {
    background-color: #45a049;
  }
`;

const InstrumentAddItem = styled(InstrumentItem)`
  margin-top: auto;
  border-top: 0px solid black;
  span {
    left: 35px;
  }
`;

const InstrumentDropdown = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  width: 100%;
  background-color: #171717;
  border-top: 1px solid black;
  z-index: 10;
  
  transform-origin: top;
  animation: ${props => props.$isVisible ? 'dropDown' : 'dropUp'} 0.2s ease-out forwards;
  
  @keyframes dropDown {
    from {
      opacity: 0;
      transform: scaleY(0);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }
  
  @keyframes dropUp {
    from {
      opacity: 1;
      transform: scaleY(1);
    }
    to {
      opacity: 0;
      transform: scaleY(0);
      visibility: hidden;
    }
  }
`;

const DropdownItem = styled.div`
  width: 100%;
  height: 40px;
  background-color: #2C2C2C;
  color: white;
  display: flex;
  align-items: center;
  padding-left: 45px;
  cursor: pointer;
  font-size: 11px;
  border-bottom: 1px solid black;

  &:hover {
    background-color: #3C3C3C;
  }
`;

const AudioTab = styled.div<{ $position: number; $width: number }>`
  position: absolute;
  height: 70%;
  background-color: rgba(163, 60, 146, 0.3);
  border: 1px solid rgb(163, 60, 146);
  border-radius: 4px;
  top: 15%;
  left: ${({ $position }) => $position}%;
  width: ${props => props.$width}%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: grab;
  user-select: none;
  pointer-events: all;

  &:active {
    cursor: grabbing;
  }

  z-index: 555;

  canvas {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
`;

const MelodySection = styled.div`
  width: 100%;
  background-color: #2C2C2C;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  position: relative; 
`;

const MelodyRow = styled.div`
  width: 100%;
  height: 50px; // высота как tab
  background-color: #2C2C2C;
  border-bottom: 1px solid black;
  display: flex;
  position: relative;

  & > div {
    width: 100%;
    height: 100%;
    position: relative;
  }
`;

const ChangeMelodyModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  max-height: 80vh;
  background: #2C2C2C;
  border-radius: 4px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
`;

const ChangeMelodyHeader = styled.div`
  width: 100%;
  height: 25%;
  background-color: #3C3C3C;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 15px;
  color: white;
  font-size: 22px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const ChangeMelodyContent = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
`;

const MelodyOption = styled.div`
  padding: 15px;
  margin: 5px 0;
  background: #3C3C3C;
  color: white;
  cursor: pointer;
  border-radius: 3px;
  
  &:hover {
    background: #4C4C4C;
  }

  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MelodyWaveformContainer = styled.div`
  width: 100%;
  height: 50px;
  background: #2C2C2C;
  border-radius: 3px;
  overflow: hidden;
`;

function App() {
  const [ScreenScale, setScreenScale] = useState(1);
  const [TimeBarsList, setTimeBars] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const topBarRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [tabsTimelinePosition, setTabsTimelinePosition] = useState(0);
  const timerRef = useRef(null);

  const [bpm, setBpm] = useState(144);
  const [bpmSeconds, setBpmSeconds] = useState(60 / bpm);
  const [bpmSteps, setBpmSteps] = useState(0);
  

  const [melodyList, setMelodyList] = useState([
    {
      id: 1,
      instrument: AvailableMelodies[2].name,
      path: AvailableMelodies[2].path,
      type: "melody",
      duration: 0,
      volume: 50,
      bars: [
        {
          id: 1,
          time: 0,
          duration: 1
        },
        {
          id: 2,
          time: 4,
          duration: 1
        }
      ]
    }
  ]);

  const [midiList, setMidiList] = useState([
    {
        "id": 1,
        "instrument": "Kick #1",
        "path": "/sounds/FullKick_07_641.wav",
        "pitch": 0,
        "type": "midi",
        "volume": 50,
        "bars": [
            {
                "id": 1,
                "time": 4,
                "duration": 1,
                "notes": [
                    {
                        "id": 1,
                        "time": 0,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 2,
                        "time": 20,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 3,
                        "time": 24,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    }
                ]
            },
            {
                "id": 2,
                "time": 5,
                "duration": 1,
                "notes": [
                    {
                        "id": 4,
                        "time": 0,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 5,
                        "time": 20,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    }
                ]
            },
            {
                "id": 3,
                "time": 6,
                "duration": 1,
                "notes": [
                    {
                        "id": 7,
                        "time": 0,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 8,
                        "time": 20,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 9,
                        "time": 24,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    }
                ]
            },
            {
                "id": 4,
                "time": 7,
                "duration": 1,
                "notes": [
                    {
                        "id": 10,
                        "time": 0,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 11,
                        "time": 20,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 12,
                        "time": 28,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    }
                ]
            }
        ]
    },
    {
        "id": 2,
        "instrument": "Clap #1",
        "path": "/sounds/909Clap_02_146_SP.wav",
        "pitch": 0,
        "type": "midi",
        "volume": 50,
        "bars": [
            {
                "id": 4,
                "time": 4,
                "duration": 1,
                "notes": [
                    {
                        "id": 4,
                        "time": 16,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    }
                ]
            },
            {
                "id": 1,
                "time": 5,
                "duration": 1,
                "notes": [
                    {
                        "id": 1,
                        "time": 16,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 2,
                        "time": 18,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 3,
                        "time": 26,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    }
                ]
            },
            {
                "id": 2,
                "time": 6,
                "duration": 1,
                "notes": [
                    {
                        "id": 2,
                        "time": 16,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    }
                ]
            },
            {
                "id": 3,
                "time": 7,
                "duration": 1,
                "notes": [
                    {
                        "id": 3,
                        "time": 16,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 4,
                        "time": 28,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    }
                ]
            }
        ]
    },
    {
        "id": 3,
        "instrument": "HiHat #1",
        "path": "/sounds/33_HiHat_SP_42_55.wav",
        "pitch": 0,
        "type": "midi",
        "volume": 50,
        "bars": [
            {
                "id": 1,
                "time": 4,
                "duration": 1,
                "notes": [
                    {
                        "id": 1,
                        "time": 0,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 2,
                        "time": 4,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 3,
                        "time": 8,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 4,
                        "time": 12,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 5,
                        "time": 16,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 6,
                        "time": 20,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 9,
                        "time": 24,
                        "duration": 1,
                        "mute": false,
                        "pitch": 14
                    },
                    {
                        "id": 10,
                        "time": 28,
                        "duration": 1,
                        "mute": false,
                        "pitch": 14
                    }
                ]
            },
            {
                "id": 2,
                "time": 5,
                "duration": 1,
                "notes": [
                    {
                        "id": 9,
                        "time": 0,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 10,
                        "time": 4,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 11,
                        "time": 8,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 12,
                        "time": 12,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 13,
                        "time": 16,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 14,
                        "time": 20,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 17,
                        "time": 24,
                        "duration": 1,
                        "mute": false,
                        "pitch": 10
                    },
                    {
                        "id": 18,
                        "time": 28,
                        "duration": 1,
                        "mute": false,
                        "pitch": 10
                    }
                ]
            },
            {
                "id": 3,
                "time": 6,
                "duration": 1,
                "notes": [
                    {
                        "id": 17,
                        "time": 0,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 18,
                        "time": 4,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 19,
                        "time": 8,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 20,
                        "time": 12,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 21,
                        "time": 16,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 22,
                        "time": 20,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 23,
                        "time": 24,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 24,
                        "time": 28,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    }
                ]
            },
            {
                "id": 4,
                "time": 7,
                "duration": 1,
                "notes": [
                    {
                        "id": 25,
                        "time": 0,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 26,
                        "time": 4,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 27,
                        "time": 8,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 28,
                        "time": 12,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 29,
                        "time": 16,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 30,
                        "time": 20,
                        "duration": 1,
                        "mute": false,
                        "pitch": 12
                    },
                    {
                        "id": 33,
                        "time": 28,
                        "duration": 1,
                        "mute": false,
                        "pitch": 14
                    },
                    {
                        "id": 34,
                        "time": 24,
                        "duration": 1,
                        "mute": false,
                        "pitch": 14
                    }
                ]
            }
        ]
    }
]);

  const [samples, setSamples] = useState({});
  const [melodyPlayers, setMelodyPlayers] = useState<{[key: string]: Tone.Player}>({});
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    rowId: null,
    time: null
  });

  // В компоненте App добавляем новое состояние
  const [notesEditModal, setNotesEditModal] = useState({
    visible: false,
    rowId: null,
    barId: null,
    notes: []
  });

  const [copiedBar, setCopiedBar] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownAnimating, setDropdownAnimating] = useState(false);

  const handleDropdownToggle = () => {
    if (!dropdownAnimating) {
      setDropdownVisible(!dropdownVisible);
      setDropdownAnimating(true);
      setTimeout(() => {
        setDropdownAnimating(false);
        if (!dropdownVisible) {
          setIsDropdownOpen(false);
        }
      }, 200);
    }
  };

  const [melodyContextMenu, setMelodyContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    melodyId: null,
    barId: null
  });

  const handleMelodyContextMenu = (e: React.MouseEvent, melodyId: number, barId: number) => {
    e.preventDefault(); // Предотвращаем появление браузерного меню
    
    setMelodyContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      melodyId,
      barId
    });
  };

  const handleCloseMelodyContextMenu = () => {
    setMelodyContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleDuplicateMelodyBar = () => {
    if (melodyContextMenu.melodyId === null || melodyContextMenu.barId === null) return;

    const wasPlaying = isPlaying;
    if (wasPlaying) {
      handleStop();
    }

    setMelodyList(prevList => {
      const newList = prevList.map(melody => {
        if (melody.id === melodyContextMenu.melodyId) {
          const originalBar = melody.bars.find(bar => bar.id === melodyContextMenu.barId);
          if (!originalBar) return melody;

          const barsNeeded = Math.ceil(melody.duration / barDurationInSeconds);

          const maxBarId = Math.max(0, ...prevList.flatMap(m => m.bars.map(b => b.id)));
          const newBar = {
            ...originalBar,
            id: maxBarId + 1,
            time: originalBar.time + barsNeeded 
          };

          const newPlayer = new Tone.Player(melody.path).toDestination();
          setMelodyPlayers(prev => ({
            ...prev,
            [melody.id]: newPlayer
          }));

          setTimeout(() => {
            visualizeMelody(melody.path, `melody-waveform-${melody.id}-${newBar.id}`);
          }, 100);

          return {
            ...melody,
            bars: [...melody.bars, newBar].sort((a, b) => a.time - b.time)
          };
        }
        return melody;
      });

      return newList;
    });

    handleCloseMelodyContextMenu();

    if (wasPlaying) {
      setTimeout(handlePlay, 100);
    }
  };

  const handleDeleteMelodyBar = () => {
    if (melodyContextMenu.melodyId === null || melodyContextMenu.barId === null) return;

    setMelodyList(prevList => {
      return prevList.map(melody => {
        if (melody.id === melodyContextMenu.melodyId) {
          return {
            ...melody,
            bars: melody.bars.filter(bar => bar.id !== melodyContextMenu.barId)
          };
        }
        return melody;
      });
    });

    handleCloseMelodyContextMenu();
  };

  React.useEffect(() => {
    const handleClickOutside = () => handleCloseMelodyContextMenu();
    if (melodyContextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [melodyContextMenu.visible]);

  React.useEffect(() => {
    const loadSamples = async () => {
      try {
        const loadedSamples = {};
        const loadedMelodyPlayers = {};

        for (const instrument of midiList) {
          try {
            if (!samples[instrument.id]) {
              const player = new Tone.Player(instrument.path).toDestination();
              loadedSamples[instrument.id] = player;
            } else {
              loadedSamples[instrument.id] = samples[instrument.id];
            }
          } catch (error) {
            console.error(`Ошибка загрузки сэмпла ${instrument.path}:`, error);
          }
        }

        for (const melody of melodyList) {
          try {
            if (!melodyPlayers[melody.id]) {
              const player = new Tone.Player(melody.path).toDestination();
              loadedMelodyPlayers[melody.id] = player;
            } else {
              loadedMelodyPlayers[melody.id] = melodyPlayers[melody.id];
            }
          } catch (error) {
            console.error(`Ошибка загрузки мелодии ${melody.path}:`, error);
          }
        }

        setSamples(loadedSamples);
        setMelodyPlayers(loadedMelodyPlayers);
        await Tone.loaded();
        setSamplesLoaded(true);
      } catch (error) {
        console.error("Ошибка при загрузке сэмплов:", error);
      }
    };
    loadSamples();
  }, [midiList, melodyList]);

  const handleIncrease = () => {
    setScreenScale(prev => prev + 0.2);
  };

  const handleDecrease = () => {
    setScreenScale(prev => Math.max(0.2, prev - 0.2));
  };

  const handlePlay = async () => {
    if (isPlaying) return;
    
    try {
      if (Tone.context.state === 'suspended') {
        await Tone.context.resume();
      }
      
      await Tone.start();
      setIsPlaying(true);
      Tone.Transport.bpm.value = bpm;
      Tone.Transport.cancel();
      Tone.Transport.seconds = currentTime;

      Object.values(melodyPlayers).forEach(player => {
        if (player instanceof Tone.Player) {
          player.stop();
        }
      });

      melodyList.forEach(melody => {
        const player = melodyPlayers[melody.id];
        if (!player) {
          console.warn(`No player found for melody ${melody.id}`);
          return;
        }

        const volume = (melody.volume / 50);
        player.volume.value = 20 * Math.log10(volume);

        melody.bars.forEach(bar => {
          const barStartTime = bar.time * (240 / bpm);

          const offset = Math.max(0, currentTime - barStartTime);

          if (barStartTime <= currentTime && offset < melody.duration) {
            console.log(`Starting melody ${melody.id} at offset ${offset}`);
            player.start("+0", offset);
          } else if (barStartTime > currentTime) {

            const delaySeconds = barStartTime - currentTime;
            console.log(`Scheduling melody ${melody.id} to start in ${delaySeconds} seconds`);
            Tone.Transport.schedule((time) => {
              player.start(time);
            }, `+${delaySeconds}`);
          }
        });
      });


      const allNotes = [];
      midiList.forEach(instrument => {
        instrument.bars.forEach(bar => {
          const maxNotes = Math.floor(32 * bar.duration);
          const barStartTime = bar.time * (240 / bpm);
          const barEndTime = barStartTime + (bar.duration * 240 / bpm);
          
          bar.notes.forEach(note => {
            if (note.time < maxNotes) {
              allNotes.push({
                id: note.id,
                time: barStartTime + (note.time / 32) * (240 / bpm),
                endTime: barEndTime,
                duration: note.duration,
                instrumentId: instrument.id,
                mute: note.mute,
                pitch: note.pitch - 13,
              });
            }
          });
        });
      });

      allNotes.sort((a, b) => a.time - b.time);

      allNotes.forEach((note, index) => {
        if (!note.mute) {
          const adjustedTime = note.time + (index * 0.001);
          Tone.Transport.schedule((time) => {
            const player = samples[note.instrumentId];
            if (player) {
              const instrument = midiList.find(i => i.id === note.instrumentId);
              if (instrument) {
                const volume = (instrument.volume / 50);
                player.volume.value = 20 * Math.log10(volume);
              }

              player.playbackRate = Math.pow(2, -note.pitch / 12);
              const playerInstance = player.start(time);

              Tone.Transport.schedule((stopTime) => {
                if (playerInstance && playerInstance.stop) {
                  playerInstance.stop();
                } else if (player.stop) {
                  player.stop();
                }
              }, note.endTime);
            }
          }, adjustedTime);
        }
      });

      Tone.Transport.start();

      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            handleStop();
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.cancel();

    melodyList.forEach(melody => {
      melody.bars.forEach(bar => {
        const player = melodyPlayers[melody.id];
        if (player) {
          player.stop();
          player.seek(0);
        }
      });
    });

    Object.values(samples).forEach(player => {
      if (player instanceof Tone.Player) {
        player.stop();
        player.seek(0);
      }
    });

    setCurrentTime(0);
    setTimelinePosition(0);
    setTabsTimelinePosition(0);
  };

  React.useEffect(() => {
    if (topBarRef.current) {
      const parentWidth = topBarRef.current.offsetWidth;
      const numBars = Math.floor(parentWidth / (parentWidth / (20 / ScreenScale)));
      const newTimeBars = Array.from({length: numBars}, (_, i) => ({id: i}));
      setTimeBars(newTimeBars);
    }
  }, [ScreenScale]);

  const [totalDuration, setTimeDuration] = useState(120);
  const getTimeString = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    const baseDuration = 120;
    setTimeDuration(baseDuration / ScreenScale);
  }, [ScreenScale]);


  React.useEffect(() => {
    const position = (currentTime / totalDuration) * 100;
    setTimelinePosition(position);
  }, [currentTime, totalDuration]);

  React.useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= totalDuration) {
            handleStop();
            return 0;
          }

          const mainTimelinePosition = (newTime / totalDuration) * 100;
          setTimelinePosition(mainTimelinePosition);


          const secondsPerBar = (60 / bpm) * 4;
          const totalBars = TimeBarsList?.length || 1;
          const barWidth = 100 / totalBars;

          const currentBar = Math.floor(newTime / secondsPerBar);

          const positionInBar = (newTime % secondsPerBar) / secondsPerBar;

          const tabPosition = (currentBar + positionInBar) * barWidth;
          setTabsTimelinePosition(tabPosition);

          return newTime;
        });
      }, 100);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, bpm, totalDuration, TimeBarsList]);

  const audioContextRef = React.useRef(null);

  const visualizeAudio = async (instrumentPath: string, canvasId: string) => {
    try {

      const waitForCanvas = async (maxAttempts = 5): Promise<HTMLCanvasElement | null> => {
        for (let i = 0; i < maxAttempts; i++) {
          const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
          if (canvas) {
            return canvas;
          }
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        return null;
      };

      const canvas = await waitForCanvas();
      if (!canvas) {
        console.warn(`Canvas ${canvasId} не найден после всех попыток`);
        return;
      }

      if (canvas.dataset.rendered === 'true') return;

      if (canvas.width === 0 || canvas.height === 0) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.offsetWidth;
          canvas.height = parent.offsetHeight;
        } else {
          canvas.width = 100;
          canvas.height = 30;
        }
      }

      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
          console.warn('Ошибка создания AudioContext:', error);
          return;
        }
      }

      const response = await fetch(instrumentPath);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      requestAnimationFrame(() => {
        try {
          const data = audioBuffer.getChannelData(0);
          const step = Math.ceil(data.length / canvas.width);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
          ctx.lineWidth = 1;

          for (let i = 0; i < canvas.width; i++) {
            const startIdx = Math.floor(i * step);
            const endIdx = Math.floor((i + 1) * step);
            
            let minValue = 1.0;
            let maxValue = -1.0;
            
            for (let j = startIdx; j < endIdx && j < data.length; j++) {
              const value = data[j];
              if (value < minValue) minValue = value;
              if (value > maxValue) maxValue = value;
            }

            const y1 = ((1 + minValue) / 2) * canvas.height;
            const y2 = ((1 + maxValue) / 2) * canvas.height;
            
            ctx.moveTo(i, y1);
            ctx.lineTo(i, y2);
          }
          
          ctx.stroke();
          canvas.dataset.rendered = 'true';
        } catch (error) {
          console.warn('Ошибка отрисовки волновой формы:', error);
        }
      });

    } catch (error) {
      console.warn('Ошибка при визуализации аудио:', error);
    }
  };

  React.useEffect(() => {
    let isMounted = true;

    const processVisualization = async () => {
      if (!isMounted) return;

      const visualizeQueue = midiList.flatMap(instrument =>
        instrument.bars.flatMap(bar =>
          bar.notes.filter(note => !note.mute).map(note => ({
            instrumentPath: instrument.path,
            canvasId: `waveform-${instrument.id}-${bar.id}-${note.id}`
          }))
        )
      );

      for (const item of visualizeQueue) {
        if (!isMounted) break;
        await visualizeAudio(item.instrumentPath, item.canvasId);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    };

    setTimeout(processVisualization, 500);

    return () => {
      isMounted = false;
    };
  }, [midiList]);

  const handleTimeBarClick = (e) => {
    const tabsList = document.querySelector('.TabsList');
    if (!tabsList) return;

    Object.values(melodyPlayers).forEach(player => {
      if (player instanceof Tone.Player) {
        player.stop();
      }
    });
    
    const tabsListRect = tabsList.getBoundingClientRect();
    const clickX = e.clientX - tabsListRect.left;
    const totalBars = TimeBarsList?.length || 1;

    const clickedBar = Math.floor((clickX / tabsListRect.width) * totalBars);
    const barOffset = (clickX / tabsListRect.width) * totalBars - clickedBar;

    const secondsPerBar = (60 / bpm) * 4;
    const newTime = clickedBar * secondsPerBar + (barOffset * secondsPerBar);
    
    if (isPlaying) {
      Object.values(melodyPlayers).forEach(player => {
        if (player instanceof Tone.Player) {
          player.stop();
        }
      });

      melodyList.forEach(melody => {
        melody.bars.forEach(bar => {
          const barStartTime = bar.time * (240 / bpm);
          const player = melodyPlayers[melody.id];
          
          if (player) {

            const offset = Math.max(0, newTime - barStartTime);
            

            if (barStartTime <= newTime && offset < melody.duration) {
              player.start("+0", offset);
            }
          }
        });
      });
    }

    const barWidth = 100 / totalBars;
    const position = clickedBar * barWidth + (barOffset * barWidth);
    
    setCurrentTime(newTime);
    setTimelinePosition(position);
    setTabsTimelinePosition(position);

    Tone.Transport.seconds = newTime;

    if (isPlaying) {
      Tone.Transport.start();
    }
  };

  const handleTabResize = (rowId: number, barId: number, newWidth: number) => {

    if (!isFinite(newWidth)) {
      console.warn('Invalid width in handleTabResize:', newWidth);
      return;
    }
    
    setMidiList(prevList => {
      const updatedList = prevList.map(row => {
        if (row.id === rowId) {
          const updatedBars = row.bars.map(bar => {
            if (bar.id === barId) {

              const maxTime = Math.floor(32 * newWidth);
              const updatedNotes = bar.notes?.map(note => ({
                ...note,
                mute: note.time > maxTime,
              })) || [];

              return {
                ...bar,
                duration: newWidth,
                notes: updatedNotes,
              };
            }
            return bar;
          });

          return {
            ...row,
            bars: updatedBars
          };
        }
        return row;
      });
      
      return updatedList;
    });
    
  };

  const handleTabResizeStart = (e: MouseEvent, rowId: number, barId: number) => {
    const element = e.target as HTMLElement;
    if (!element || !element.parentElement) return;

    const rect = element.getBoundingClientRect();
    const resizeZoneWidth = rect.width * 0.2;
    
    if (e.clientX < rect.right - resizeZoneWidth) {
      return;
    }

    resizeObserver.disconnect();
    
    const parentElement = element.parentElement;
    const parentRect = parentElement.getBoundingClientRect();
    const startX = e.clientX;
    const initialWidth = element.offsetWidth;
    
    const onResize = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidthPx = initialWidth + deltaX;
      const newWidth = newWidthPx / parentRect.width;
      const clampedWidth = Math.max(0.1, Math.min(1, newWidth));

      element.style.width = `${clampedWidth * 100}%`;
      handleTabResize(rowId, barId, clampedWidth);
    };

    const onResizeEnd = () => {
      document.removeEventListener('mousemove', onResize);
      document.removeEventListener('mouseup', onResizeEnd);
      

      const musicTabs = document.querySelectorAll('[data-row-id][data-bar-id]');
      musicTabs.forEach(tab => resizeObserver.observe(tab));
    };

    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', onResizeEnd);
  };


  const [resizeObserver] = useState(() => new ResizeObserver((entries) => {

  }));


  React.useEffect(() => {
    const musicTabs = document.querySelectorAll('[data-row-id][data-bar-id]');
    
    musicTabs.forEach((tab: HTMLElement) => {

      const rowId = parseInt(tab.dataset.rowId);
      const barId = parseInt(tab.dataset.barId);
      
      const row = midiList.find(r => r.id === rowId);
      const bar = row?.bars.find(b => b.id === barId);
      
      if (bar) {
        tab.style.width = `${bar.duration * 100}%`;
      }
      
      resizeObserver.observe(tab);
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeObserver, midiList]);

  const handleDragStart = (e: React.DragEvent, rowId: number, barId: number) => {

    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const resizeZoneWidth = rect.width * 0.2;
    
    if (e.clientX > rect.right - resizeZoneWidth) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('text/plain', JSON.stringify({ rowId, barId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTime: number) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { rowId, barId } = data;

      const wasPlaying = isPlaying;
      if (isPlaying) {
        handleStop();
      }

      setMidiList(prevList => {
        const newList = prevList.map(row => {
          if (row.id === rowId) {
            const updatedBars = row.bars.map(bar => {
              if (bar.id === barId) {
                return { 
                  ...bar, 
                  time: targetTime,
                  notes: bar.notes.map(note => ({
                    ...note,
                    barTime: targetTime
                  }))
                };
              }
              return bar;
            });

            return { ...row, bars: [...updatedBars].sort((a, b) => a.time - b.time) };
          }
          return row;
        });

        Tone.Transport.cancel();

        if (wasPlaying) {
          setTimeout(() => {
            handlePlay();
          }, 100);
        }

        return newList;
      });
    } catch (error) {
      console.error('Ошибка при обработке перетаскивания:', error);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, rowId: number, time: number) => {
    e.preventDefault();
    
    const row = midiList.find(r => r.id === rowId);
    const hasExistingTab = row?.bars.some(bar => bar.time === time);
    
    if (!hasExistingTab) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        rowId,
        time
      });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleNewTab = () => {
    if (contextMenu.rowId !== null && contextMenu.time !== null) {
      setMidiList(prevList => {
        return prevList.map(row => {
          if (row.id === contextMenu.rowId) {
            const newBar = {
              id: Math.max(0, ...row.bars.map(b => b.id)) + 1,
              time: contextMenu.time,
              duration: 1,
              notes: []
            };
            return {
              ...row,
              bars: [...row.bars, newBar].sort((a, b) => a.time - b.time)
            };
          }
          return row;
        });
      });
    }
    handleCloseContextMenu();
  };

  const handleCopyNotes = () => {

    
    const row = midiList.find(r => r.id === notesEditModal.rowId);
    const bar = row?.bars.find(b => b.id === notesEditModal.barId);
    
    if (bar) {
      setCopiedBar({
        ...bar,
        id: null,
        time: null,
        notes: [...bar.notes]
      });
    } else {
      console.log('Bar not found:', { rowId: notesEditModal.rowId, barId: notesEditModal.barId, row });
    }
    
    handleCloseNotesEdit();
  };

  const handlePaste = () => {
    if (!copiedBar || !contextMenu.rowId || contextMenu.time === null) return;

    setMidiList(prevList => {
      return prevList.map(row => {
        if (row.id === contextMenu.rowId) {

          const maxNoteId = Math.max(
            0,
            ...row.bars.flatMap(b => b.notes.map(n => n.id))
          );
          
          const newBar = {
            ...copiedBar,
            id: Math.max(0, ...row.bars.map(b => b.id)) + 1,
            time: contextMenu.time,
            notes: copiedBar.notes.map((note, index) => ({
              ...note,
              id: maxNoteId + index + 1 
            }))
          };
          
          return {
            ...row,
            bars: [...row.bars, newBar].sort((a, b) => a.time - b.time)
          };
        }
        return row;
      });
    });
    
    handleCloseContextMenu();
  };

  React.useEffect(() => {
    const handleClickOutside = () => handleCloseContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);

  const handleMusicTabContextMenu = (e: React.MouseEvent, rowId: number, barId: number) => {
    e.preventDefault();
    
    const row = midiList.find(r => r.id === rowId);
    const bar = row?.bars.find(b => b.id === barId);
    
    if (bar) {
      setNotesEditModal({
        visible: true,
        rowId: rowId,
        barId: barId,
        notes: [...bar.notes]
      });

    }
  };

  const handleCloseNotesEdit = () => {
    setNotesEditModal({
      visible: false,
      rowId: null,
      barId: null,
      notes: []
    });
  };

  const handleToggleNoteMute = (noteId: number) => {
    setMidiList(prevList => {
      return prevList.map(row => {
        if (row.id === notesEditModal.rowId) {
          return {
            ...row,
            bars: row.bars.map(bar => {
              if (bar.id === notesEditModal.barId) {
                return {
                  ...bar,
                  notes: bar.notes.map(note => {
                    if (note.id === noteId) {
                      return { ...note, mute: !note.mute };
                    }
                    return note;
                  })
                };
              }
              return bar;
            })
          };
        }
        return row;
      });
    });
  };

  const handleAcceptChanges = () => {
    handleCloseNotesEdit();
  };

  const handleNoteClick = (row: number, col: number) => {
    if (notesEditModal.rowId === undefined || notesEditModal.barId === undefined) {
      return;
    }

    setMidiList(prevList => {
      const currentRow = prevList.find(r => r.id === notesEditModal.rowId);
      if (!currentRow) return prevList;

      const currentBar = currentRow.bars.find(b => b.id === notesEditModal.barId);
      if (!currentBar) return prevList;

      const newList = prevList.map(musicRow => {
        if (musicRow.id === notesEditModal.rowId) {
          return {
            ...musicRow,
            bars: musicRow.bars.map(bar => {
              if (bar.id === notesEditModal.barId) {
                const existingNote = bar.notes.find(
                  note => note.pitch === row && note.time === col
                );

                let newNotes;
                if (existingNote) {
                  newNotes = bar.notes.filter(note => 
                    note.pitch !== row || note.time !== col
                  );
                } else {
                  const newNote = {
                    id: Math.max(0, ...bar.notes.map(n => n.id)) + 1,
                    time: col,
                    duration: 1,
                    mute: false,
                    pitch: row
                  };
                  newNotes = [...bar.notes, newNote];
                }

                return {
                  ...bar,
                  notes: newNotes
                };
              }
              return bar;
            })
          };
        }
        return musicRow;
      });

      const updatedBar = newList
        .find(r => r.id === notesEditModal.rowId)
        ?.bars.find(b => b.id === notesEditModal.barId);

      if (updatedBar) {
        setNotesEditModal(prev => ({
          ...prev,
          notes: [...updatedBar.notes]
        }));
      }

      return newList;
    });
  };

  const handleDeleteBar = () => {
    if (notesEditModal.rowId === null || notesEditModal.barId === null) {
      console.log('No bar selected for deletion');
      return;
    }

    setMidiList(prevList => {
      const newList = prevList.map(row => {
        if (row.id === notesEditModal.rowId) {
          console.log('Found row:', row.id);
          console.log('Bars before deletion:', row.bars);
          
          const filteredBars = row.bars.filter(bar => {
            const shouldKeep = bar.id !== notesEditModal.barId;
            console.log('Bar:', bar.id, 'Should keep:', shouldKeep);
            return shouldKeep;
          });
          
          console.log('Bars after deletion:', filteredBars);
          
          return {
            ...row,
            bars: filteredBars
          };
        }
        return row;
      });

      return newList;
    });

    handleCloseNotesEdit();
  };

  const handleDeleteInstrument = (instrumentId: number) => {
    setMidiList(prevList => prevList.filter(item => item.id !== instrumentId));
  };

  const handleAddInstrument = (instrument) => {
    setMidiList(prevList => {
      const newId = Math.max(0, ...prevList.map(item => item.id)) + 1;
      return [...prevList, {
        id: newId,
        instrument: instrument.name,
        path: instrument.path,
        pitch: 0,
        type: "midi",
        volume: 50,
        bars: []
      }];
    });
    setIsDropdownOpen(false);
  };

  React.useEffect(() => {
    const loadMelodies = async () => {
      try {
        const loadedMelodyPlayers = {};
        
        await Promise.all(melodyList.map(async (melody) => {
          try {
            const player = new Tone.Player({
              url: melody.path,
              onload: () => {
                console.log(`Melody loaded: ${melody.instrument}`);

                melody.bars.forEach(bar => {
                  visualizeMelody(melody.path, `melody-waveform-${melody.id}-${bar.id}`);
                });
              },
              onerror: (error) => {
                console.error(`Error loading melody ${melody.instrument}:`, error);
              }
            }).toDestination();

            loadedMelodyPlayers[melody.id] = player;
            
            const duration = await getAudioDuration(melody.path);

            setMelodyList(prevList => 
              prevList.map(m => 
                m.id === melody.id ? { ...m, duration } : m
              )
            );
            
          } catch (error) {
            console.error(`Error initializing melody ${melody.instrument}:`, error);
          }
        }));


        setMelodyPlayers(loadedMelodyPlayers);
        
        const firstMelody = AvailableMelodies.find(m => m.path === melodyList[0].path);
        if (firstMelody) {
          setBpm(firstMelody.bpm);
          setBpmSeconds(60 / firstMelody.bpm);
        }

      } catch (error) {
        console.error('Error loading melodies:', error);
      }
    };

    loadMelodies();
  }, []);

  const visualizeMelody = async (audioPath: string, canvasId: string) => {
    try {

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas || canvas.dataset.rendered === 'true') return;

      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }

      const response = await fetch(audioPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / canvas.width);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.lineWidth = 1;

      for (let i = 0; i < canvas.width; i++) {
        const startIdx = Math.floor(i * step);
        const endIdx = Math.floor((i + 1) * step);
        
        let minValue = 1.0;
        let maxValue = -1.0;
        
        for (let j = startIdx; j < endIdx && j < data.length; j++) {
          const value = data[j];
          if (value < minValue) minValue = value;
          if (value > maxValue) maxValue = value;
        }

        const y1 = ((1 + minValue) / 2) * canvas.height;
        const y2 = ((1 + maxValue) / 2) * canvas.height;
        
        ctx.moveTo(i, y1);
        ctx.lineTo(i, y2);
      }
      
      ctx.stroke();
      canvas.dataset.rendered = 'true';
      
    } catch (error) {
      console.error('Error visualizing melody:', error, 'Path:', audioPath, 'Canvas ID:', canvasId);
    }
  };
  console.log(midiList)

  const getAudioDuration = async (audioPath: string): Promise<number> => {
    try {
      const response = await fetch(audioPath);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer.duration;
    } catch (error) {
      console.warn('Ошибка при получении длительности аудио:', error);
      return 0;
    }
  };

  // Вычисляем длительность одного такта в секундах
  const barDurationInSeconds = (60 / bpm) * 4; // 4 доли в такте

  const handleMelodyDragStart = (e: React.DragEvent, melodyId: number, barId: number) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', JSON.stringify({ 
      type: 'melody',
      melodyId, 
      barId 
    }));
    
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleMelodyDrop = (e: React.DragEvent, targetTime: number) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type !== 'melody') return;
      
      const { melodyId, barId } = data;

      const wasPlaying = isPlaying;
      if (isPlaying) {
        handleStop();
      }

      setMelodyList(prevList => {
        return prevList.map(melody => {
          if (melody.id === melodyId) {
            return {
              ...melody,
              bars: melody.bars.map(bar => {
                if (bar.id === barId) {
                  return { ...bar, time: targetTime };
                }
                return bar;
              }).sort((a, b) => a.time - b.time)
            };
          }
          return melody;
        });
      });

      if (wasPlaying) {
        setTimeout(handlePlay, 100);
      }
    } catch (error) {
      console.error('Ошибка при обработке перетаскивания мелодии:', error);
    }
  };

  const [changeMelodyModal, setChangeMelodyModal] = useState({
    visible: false,
    melodyId: null
  });

  const handleOpenChangeMelody = (melodyId: number) => {
    setChangeMelodyModal({
      visible: true,
      melodyId
    });
  };

  const handleCloseChangeMelody = () => {
    setChangeMelodyModal({
      visible: false,
      melodyId: null
    });
  };

  const handleChangeMelody = useCallback(async (newMelody) => {
    if (!changeMelodyModal.melodyId) {
      console.log('No melody ID in modal state:', changeMelodyModal);
      return;
    }

    const oldPlayer = melodyPlayers[changeMelodyModal.melodyId];
    if (oldPlayer) {
      oldPlayer.stop();
      oldPlayer.dispose();
    }

    const newPlayer = new Tone.Player({
      url: newMelody.path,
      onload: () => {
        console.log(`New melody loaded: ${newMelody.name}`);
        visualizeMelody(newMelody.path, `melody-waveform-${changeMelodyModal.melodyId}-1`);
      }
    }).toDestination();

    setMelodyPlayers(prev => ({
      ...prev,
      [changeMelodyModal.melodyId]: newPlayer
    }));

    setBpm(newMelody.bpm);
    setBpmSeconds(60 / newMelody.bpm);

    setMelodyList(prevList => 
      prevList.map(melody => {
        if (melody.id === changeMelodyModal.melodyId) {
          return {
            ...melody,
            instrument: newMelody.name,
            path: newMelody.path,
            duration: 0,
            bars: [
              {
                id: 1,
                time: 0,
                duration: 1
              }
            ]
          };
        }
        return melody;
      })
    );

    const duration = await getAudioDuration(newMelody.path);
    
    setMelodyList(prevList => 
      prevList.map(melody => {
        if (melody.id === changeMelodyModal.melodyId) {
          return {
            ...melody,
            duration
          };
        }
        return melody;
      })
    );

    handleCloseChangeMelody();
  }, [changeMelodyModal.melodyId, melodyPlayers]);

  React.useEffect(() => {
    if (changeMelodyModal.visible) {
      AvailableMelodies.forEach((melody, index) => {
        visualizeMelody(melody.path, `melody-preview-${index}`);
      });
    }
  }, [changeMelodyModal.visible]);

  React.useEffect(() => {
    melodyList.forEach(melody => {
      const player = melodyPlayers[melody.id];
      if (player) {
        const volume = (melody.volume / 50);
        player.volume.value = 20 * Math.log10(volume);
      }
    });
  }, [melodyList, melodyPlayers]);

  React.useEffect(() => {
    midiList.forEach(instrument => {
      const player = samples[instrument.id];
      if (player) {
        const volume = (instrument.volume / 50);
        player.volume.value = 20 * Math.log10(volume);
      }
    });
  }, [midiList, samples]);

  return (
    <div className="App">
      <InstrumentsContainer>
        <InstrumentsLogo>
              <h1>Huskar Studio</h1>
        </InstrumentsLogo>

        <InstrumentsBody>

          <InstrumentsList>
          {midiList.map(instrument => (
            <InstrumentItem key={instrument.id}>
              <span>{instrument.instrument}</span>

                
                <DeleteInstrumentButton 
                  onClick={() => handleDeleteInstrument(instrument.id)}
                >
                  -
                </DeleteInstrumentButton>
                <VolumeSlider
                  type="range"
                  min="0"
                  max="100"
                  value={instrument.volume || 50}
                  onChange={(e) => {
                    const wasPlaying = isPlaying;
                    if (wasPlaying) {
                      handleStop();
                    }

                    const newVolume = parseInt(e.target.value);
                    setMidiList(prevList =>
                      prevList.map(item =>
                        item.id === instrument.id
                          ? { ...item, volume: newVolume }
                          : item
                      )
                    );
                    
                    const player = samples[instrument.id];
                    if (player) {
                      const volume = newVolume / 50;
                      player.volume.value = 20 * Math.log10(volume);
                    }

                    if (wasPlaying) {
                      setTimeout(handlePlay, 100);
                    }
                  }}
                />
            </InstrumentItem>
          ))}
          <InstrumentAddItem>
            <span></span>
            <InstrumentAddButton onClick={handleDropdownToggle}>
              +
            </InstrumentAddButton>
            {(dropdownVisible || dropdownAnimating) && (
              <InstrumentDropdown $isVisible={dropdownVisible}>
                {AvailibleInstruments.map((instrument, index) => (
                  <DropdownItem
                    key={index}
                    onClick={() => {
                      handleAddInstrument(instrument);
                      setDropdownVisible(false);
                    }}
                  >
                    {instrument.name}
                  </DropdownItem>
                ))}
              </InstrumentDropdown>
            )}
          </InstrumentAddItem>
          </InstrumentsList>
          <InstrumentsMelodyList>
            {melodyList.map(melody => (
              <InstrumentsMelodyItem key={melody.id}>
                <span>{melody.instrument}</span>
                  <InstrumentsMelodyButton 
                    onClick={() => handleOpenChangeMelody(melody.id)}
                  >
                    {">"}
                  </InstrumentsMelodyButton>
                  <VolumeSlider
                    type="range"
                    min="0"
                    max="100"
                    value={melody.volume || 50}
                    onChange={(e) => {
                      const wasPlaying = isPlaying;
                      if (wasPlaying) {
                        handleStop();
                      }

                      const newVolume = parseInt(e.target.value);
                      setMelodyList(prevList =>
                        prevList.map(item =>
                          item.id === melody.id
                            ? { ...item, volume: newVolume }
                            : item
                        )
                      );
                      
                      const player = melodyPlayers[melody.id];
                      if (player) {
                        const volume = newVolume / 50;
                        player.volume.value = 20 * Math.log10(volume);
                      }

                      if (wasPlaying) {
                        setTimeout(handlePlay, 100);
                      }
                    }}
                  />
              </InstrumentsMelodyItem>
            ))}
          </InstrumentsMelodyList>
        </InstrumentsBody>
      </InstrumentsContainer>

      <div className="engine">
        <div>
          <TopBar ref={topBarRef}>
            <TopSection>
              <TimeInfo>
                <TimeInfoNumber>
                  {getTimeString(Math.floor(currentTime))}
                </TimeInfoNumber>
              </TimeInfo>
              <ButtonContainer>

                <PlayButton onClick={handlePlay} $isPlaying={isPlaying}>▶</PlayButton>
                <StopButton onClick={handleStop} $isPlaying={isPlaying}><p>■</p></StopButton>
                <Button onClick={handleDecrease}>-</Button>
                <Button onClick={handleIncrease}>+</Button>
              </ButtonContainer>
            </TopSection>
            <TimeBarSection>
              {TimeBarsList?.map((timebar, index) => (
                <TimeBar 
                  key={timebar.id} 
                  $index={index}
                  style={{width: `${100/TimeBarsList.length}%`}}
                  onClick={(e) => handleTimeBarClick(e)}
                >
                  {Array.from({length: ScreenScale * 4}, (_, i) => (
                    <TimeBarContentItem 
                      key={i} 
                      $index={i} 
                      style={{width: `${100/(ScreenScale * 4)}%`}}
                    >

                    </TimeBarContentItem>
                  ))}
                </TimeBar>
              ))}
            </TimeBarSection>
          </TopBar>

          <TabsList className="TabsList">
            <TabsTimeline $position={tabsTimelinePosition} />
            {midiList.map((row) => (
              <TabsRow key={row.id} $rowIndex={row.id}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {TimeBarsList?.map((timebar, index) => (
                    <TabsRowTab 
                      key={timebar.id}
                      $index={index}
                      $position={(100/TimeBarsList.length) * index}
                      $width={100/TimeBarsList.length}
                      onDragOver={handleDragOver}
                      onDrop={(e) => {
                        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                        if (data.type === 'melody') {
                          handleMelodyDrop(e, index);
                        } else {
                          handleDrop(e, index);
                        }
                      }}
                      onContextMenu={(e) => handleContextMenu(e, row.id, index)}
                    >
                      {row.bars
                        .filter(bar => bar.time === index)
                        .map(bar => (
                          row.type !== "melody" && (
                            <MidiTab
                              key={`${row.id}-${bar.id}`}
                              $position={0}
                              $width={bar.duration || 1}
                              data-row-id={row.id}
                              data-bar-id={bar.id}
                              data-bar-time={bar.time}
                              draggable
                              onMouseDown={(e) => handleTabResizeStart(e, row.id, bar.id)}
                              onDragStart={(e) => handleDragStart(e, row.id, bar.id)}
                              onContextMenu={(e) => handleMusicTabContextMenu(e, row.id, bar.id)}
                            >
                              {bar.notes.map((note, index) => {
                                const nextNote = bar.notes[index + 1];
                                const isLastNote = index === bar.notes.length - 1;
                                const maxDuration = 32 * bar.duration;
                                const duration = isLastNote
                                  ? Math.min(maxDuration - note.time, maxDuration * bar.duration)
                                  : nextNote.time - note.time;

                                return (
                                  <WaveformCanvas
                                    key={`waveform-${row.id}-${bar.id}-${note.id}`}
                                    id={`waveform-${row.id}-${bar.id}-${note.id}`}
                                    $position={note.time}
                                    $width={duration}
                                    $originalDuration={maxDuration}
                                    data-mute={note.mute.toString()}
                                  />
                                );
                              })}
                            </MidiTab>
                          )
                        ))
                      }
                    </TabsRowTab>
                  ))}
                </div>
              </TabsRow>
            ))}
            
            {contextMenu.visible && (
              <ContextMenu 
                style={{ 
                  left: contextMenu.x, 
                  top: contextMenu.y 
                }}
              >
                <MenuItem onClick={handleNewTab}>New Tab</MenuItem>
                {copiedBar && (
                  <MenuItem onClick={handlePaste}>
                    Paste
                  </MenuItem>
                )}
              </ContextMenu>
            )}
          </TabsList>
        </div>

        <div>
          <MelodySection>
            <TabsTimeline $position={tabsTimelinePosition} />
            {melodyList.map((melody) => (
              <MelodyRow key={melody.id}>
                <div 
                  style={{ position: 'relative', width: '100%', height: '100%' }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const barIndex = Math.floor((x / rect.width) * TimeBarsList?.length);
                    handleMelodyDrop(e, barIndex);
                  }}
                >
                  {TimeBarsList?.map((timebar, index) => (
                    <TabsRowTab 
                      key={timebar.id}
                      $index={index}
                      $position={(100/TimeBarsList.length) * index}
                      $width={100/TimeBarsList.length}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleMelodyDrop(e, index)}
                    />
                  ))}
                  {melody.bars.map((bar, index) => {
                    const barsNeeded = melody.duration / barDurationInSeconds;
                    
                    return (
                      <AudioTab
                        key={`melody-${melody.id}-${bar.id}`}
                        $position={bar.time * (100 / TimeBarsList?.length || 1)}
                        $width={barsNeeded * (100 / TimeBarsList?.length || 1)}
                        draggable
                        onDragStart={(e) => handleMelodyDragStart(e, melody.id, bar.id)}
                        onContextMenu={(e) => handleMelodyContextMenu(e, melody.id, bar.id)}
                      >
                        <canvas
                          id={`melody-waveform-${melody.id}-${bar.id}`}
                          width="1000"
                          height="100"
                        />
                      </AudioTab>
                    );
                  })}
                </div>
              </MelodyRow>
            ))}
          </MelodySection>

          <BottomBarSection>
            <TimeBarSection>
              <Timeline $position={timelinePosition} $isPlaying={isPlaying} />
              {TimeBarsList?.map((timebar, index) => (
                <BottomTimeBar 
                  key={timebar.id} 
                  $index={index} 
                  style={{width: `${100/TimeBarsList.length}%`}}
                >
                  <BottomTimeInfo>
                    <BottomTimeInfoNumber>
                      {getTimeString(Math.floor((totalDuration / TimeBarsList?.length || 1) * index))}
                    </BottomTimeInfoNumber>
                  </BottomTimeInfo>
                </BottomTimeBar>
              ))}
            </TimeBarSection>

          </BottomBarSection>
        </div>
      </div>

      {notesEditModal.visible && (
        <>
          <ModalOverlay onClick={handleCloseNotesEdit} />
          <NotesEditModal onClick={e => e.stopPropagation()}>
            <NotesEditToolbar>
              <EditToolbarButton 
                onClick={() => {
                  handleCopyNotes();
                }}
              >
                Copy
              </EditToolbarButton>
              <EditToolbarButton onClick={handleDeleteBar}>
                Delete
              </EditToolbarButton>
            </NotesEditToolbar>
            <NotesContent>
              <NotesInfo>
              <NotesInfoItem>C</NotesInfoItem>
              <NotesInfoItem>B</NotesInfoItem>
              <NotesInfoItem>A#</NotesInfoItem>
              <NotesInfoItem>A</NotesInfoItem>
              <NotesInfoItem>G#</NotesInfoItem>
              <NotesInfoItem>G</NotesInfoItem>
              <NotesInfoItem>F#</NotesInfoItem>
              <NotesInfoItem>F</NotesInfoItem>
              <NotesInfoItem>E</NotesInfoItem>
              <NotesInfoItem>D#</NotesInfoItem>
              <NotesInfoItem>D</NotesInfoItem>
              <NotesInfoItem>C#</NotesInfoItem>
              <NotesInfoItem>C</NotesInfoItem>
              <NotesInfoItem>B</NotesInfoItem>
              <NotesInfoItem>A#</NotesInfoItem>
              <NotesInfoItem>A</NotesInfoItem>
              <NotesInfoItem>G#</NotesInfoItem>
              <NotesInfoItem>G</NotesInfoItem>
              <NotesInfoItem>F#</NotesInfoItem>
              <NotesInfoItem>F</NotesInfoItem>
              <NotesInfoItem>E</NotesInfoItem>
              <NotesInfoItem>D#</NotesInfoItem>
              <NotesInfoItem>D</NotesInfoItem>
              <NotesInfoItem>C#</NotesInfoItem>
              <NotesInfoItem>C</NotesInfoItem>
              </NotesInfo>
              <NoteContainer>
                {Array.from({ length: 25 }, (_, row) => (
                  Array.from({ length: 32 }, (_, col) => {
                    const notes = notesEditModal.notes;
                    const isActive = notes.some(note => {
                      const match = !note.mute && note.pitch === row && note.time === col;
                      return match;
                    });

                    return (
                      <Note 
                        key={`${row}-${col}`} 
                        $isActive={isActive}
                        $colIndex={col % 8}
                        onClick={() => {
                          handleNoteClick(row, col);
                        }}
                      />
                    );
                  })
                )).flat()}
              </NoteContainer>
            </NotesContent>
          </NotesEditModal>
        </>
      )}

      {melodyContextMenu.visible && (
        <ContextMenu 
          style={{ 
            left: melodyContextMenu.x, 
            top: melodyContextMenu.y 
          }}
          onClick={e => e.stopPropagation()}
        >
          <MenuItem onClick={handleDuplicateMelodyBar}>Duplicate</MenuItem>
          <MenuItem onClick={handleDeleteMelodyBar}>Delete</MenuItem>
        </ContextMenu>
      )}

      {changeMelodyModal.visible && (
        <>
          <ModalOverlay onClick={handleCloseChangeMelody} />
          <ChangeMelodyModal onClick={e => e.stopPropagation()}>
            <ChangeMelodyHeader>
              Change Melody
            </ChangeMelodyHeader>
            <ChangeMelodyContent>
              {AvailableMelodies.map((melody, index) => (
                <MelodyOption 
                  key={index}
                  onClick={() => handleChangeMelody(melody)}
                >
                  <span>{melody.name} ({melody.bpm} BPM)</span>
                  <MelodyWaveformContainer>
                    <canvas
                      id={`melody-preview-${index}`}
                      width="400"
                      height="50"
                    />
                  </MelodyWaveformContainer>
                </MelodyOption>
              ))}
            </ChangeMelodyContent>
          </ChangeMelodyModal>
        </>
      )}
    </div>
  );
}

export default App;
